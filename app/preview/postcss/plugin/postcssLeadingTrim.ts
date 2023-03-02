"use client";
import postcss, {
  Container,
  Declaration,
  PluginCreator,
  Root,
  Rule,
  ChildNode,
} from "postcss";
import metrics from "./metrics";

const textEdgeOffsets = {
  normal: {
    top: `0px`,
    bottom: `0px`,
  },
  cap: {
    top: `var(--text-box-trim-start-cap)`,
    bottom: null,
  },
  alphabetic: {
    top: null,
    bottom: `var(--text-box-trim-end-alphabetic)`,
  },
  text: {
    top: `var(--text-box-trim-start-text)`,
    bottom: `var(--text-box-trim-end-text)`,
  },
  ex: {
    top: `var(--text-box-trim-start-ex)`,
    bottom: null,
  },
  ideographic: {
    top: `-0.161em`,
    bottom: `-0.168em`,
  },
  "ideographic-ink": {
    top: `-0.241em`,
    bottom: `-0.26em`,
  },
};

const textOverEdgeValues = [
  "normal",
  "text",
  "cap",
  "ex",
  "ideographic",
  "ideographic-ink",
] as const;

const textUnderEdgeValues = [
  "normal",
  "text",
  "alphabetic",
  "ideographic",
  "ideographic-ink",
] as const;

const isValidTextOverEdgeValue = (
  value?: string
): value is typeof textOverEdgeValues[number] =>
  (textOverEdgeValues as ReadonlyArray<unknown>).includes(value);
const isValidTextUnderEdgeValue = (
  value?: string
): value is typeof textUnderEdgeValues[number] =>
  (textUnderEdgeValues as ReadonlyArray<unknown>).includes(value);

const replaceTextEdgeNode = (node: Declaration) => {
  const values = node.value.split(" ");
  const textOverEdge = isValidTextOverEdgeValue(values[0])
    ? values[0]
    : undefined;
  // If only one value is specified, both edges are assigned that same keyword if possible;
  // else "text" is assumed as the missing value.
  let textUnderEdgeValue = values[1] || textOverEdge;
  if (!values[1] && !isValidTextUnderEdgeValue(textOverEdge)) {
    textUnderEdgeValue = "text";
  }
  const textUnderEdge = isValidTextUnderEdgeValue(textUnderEdgeValue)
    ? textUnderEdgeValue
    : undefined;
  const top = textOverEdge && textEdgeOffsets[textOverEdge].top;
  const bottom = textUnderEdge && textEdgeOffsets[textUnderEdge].bottom;

  const topValue = !top ? "" : `--text-box-trim-start: ${top};`;
  const bottomValue = !bottom ? "" : `--text-box-trim-end: ${bottom};`;
  const replacement = topValue + bottomValue;
  node.after(replacement);
  node.remove();
  return { textOverEdge, textUnderEdge };
};

const replaceLeadingTrimNode = (node: Declaration) => {
  const parent = node.parent;
  if (!parent || !(parent instanceof Rule)) {
    return;
  }
  const parentSelector = parent.selector.includes(",")
    ? `:where(${parent.selector})`
    : parent.selector;
  const value = node.value.trim();
  if (value === "start" || value === "both") {
    parent.after(
      `
    ${parentSelector}:before {
      content: '';
      margin-bottom: var(--text-box-trim-start);
      display: table;
    }`.trim()
    );
  }
  if (value === "end" || value === "both") {
    parent.after(
      `
    ${parentSelector}:after {
      content: '';
      margin-top: var(--text-box-trim-end);
      display: table;
    }`.trim()
    );
  }
  node.remove();
};

type pluginOptions = {
  defaultFont?: keyof typeof metrics;
};

const getFirstFont = (node: Declaration) => {
  const fonts = node.value.toLowerCase().trim();
  // get first font name from font-family: "font 1", font2, font3
  const font = fonts
    .split(",")[0]
    .trim()
    .replace(/([" '])/g, "");
  const fontMetricName = (
    Object.keys(metrics) as Array<keyof typeof metrics>
  ).find((key) => key.toLowerCase() === font);
  if (!fontMetricName) {
    return;
  }
  return fontMetricName;
};

const getFontMetrics = (
  name: keyof typeof metrics,
  textEdges: Set<
    | "normal"
    | "text"
    | "cap"
    | "ex"
    | "ideographic"
    | "ideographic-ink"
    | "alphabetic"
  >
) => {
  const fontName = name.toLowerCase();
  const metric = metrics[name];
  if (!metric) {
    return;
  }
  const definitions = new Set<string>();
  const lineGap = `--font-${fontName}-line-gap: ${
    metric.lineGap / metric.unitsPerEm
  }em;`;
  const ascent = `--font-${fontName}-ascent: ${
    metric.ascent / metric.unitsPerEm
  }em;`;
  if (textEdges.has("text")) {
    definitions.add(lineGap);
    definitions.add(
      `--font-${fontName}-text-box-trim-start-text: calc(var(--font-${fontName}-line-gap) / 2);`
    );
    definitions.add(
      `--font-${fontName}-text-box-trim-end-text: calc(var(--font-${fontName}-line-gap) / 2);`
    );
  }
  if (textEdges.has("cap")) {
    if (!("capHeight" in metric)) {
      throw new Error(`cap not supported for font "${name}"`);
    }
    definitions.add(ascent);
    definitions.add(
      `--font-${fontName}-cap-height: ${
        metric.capHeight / metric.unitsPerEm
      }em;`
    );
    definitions.add(lineGap);
    definitions.add(
      `--font-${fontName}-text-box-trim-start-cap: calc((var(--font-${fontName}-cap-height) - var(--font-${fontName}-ascent) + var(--font-${fontName}-line-gap) / 2));`
    );
  }
  if (textEdges.has("ex")) {
    if (!("xHeight" in metric)) {
      throw new Error(`ex not supported for font "${name}"`);
    }
    definitions.add(ascent);
    definitions.add(lineGap);
    definitions.add(
      `--font-${fontName}-x-height: ${metric.xHeight / metric.unitsPerEm}em;`
    );
    definitions.add(
      `--font-${fontName}-text-box-trim-start-ex: calc((var(--font-${fontName}-x-height) - var(--font-${fontName}-ascent) + var(--font-${fontName}-line-gap) / 2));`
    );
  }
  if (textEdges.has("alphabetic")) {
    if (!("descent" in metric)) {
      throw new Error(`alphabetic not supported for font "${name}"`);
    }
    definitions.add(
      `--font-${fontName}-descent: ${metric.descent / metric.unitsPerEm}em;`
    );
    definitions.add(lineGap);
    definitions.add(
      `--font-${fontName}-text-box-trim-end-alphabetic: calc((var(--font-${fontName}-descent) - var(--font-${fontName}-line-gap) / 2));`
    );
  }
  if (definitions.size === 0) {
    return "";
  }
  return " " + [...definitions].join("\n  ") + "\n";
};

const postcssLeadingTrim: PluginCreator<pluginOptions> = (
  opts?: pluginOptions
) => ({
  postcssPlugin: "postcss-text-box-trim",
  prepare: () => {
    let root: Root | undefined;
    const state = {
      textOverEdge: new Set<typeof textOverEdgeValues[number]>(),
      textUnderEdge: new Set<typeof textUnderEdgeValues[number]>(),
      font: new Set<keyof typeof metrics>(),
      trim: new Set<"normal" | "start" | "both" | "end">(),
      rule: new Map<Container<ChildNode>, keyof typeof metrics>(),
    };
    // The default browser base font is Times New Roman:
    const defaultFont: keyof typeof metrics | undefined =
      opts && "defaultFont" in opts ? opts.defaultFont : "timesNewRoman";
    return {
      OnceExit() {
        if (!root) {
          return;
        }
        // Skip if no text-box-trim properties are used
        if (
          state.trim.size === 0 ||
          (state.trim.size === 1 && state.trim.has("normal"))
        ) {
          return;
        }
        // Skip if no text-over-edge or text-under-edge properties are used
        const overEdges =
          state.trim.has("start") || state.trim.has("both")
            ? Array.from(state.textOverEdge)
            : [];
        const underEdges =
          state.trim.has("end") || state.trim.has("both")
            ? Array.from(state.textUnderEdge)
            : [];
        const textEdges = new Set([...overEdges, ...underEdges]);
        textEdges.delete("normal");
        if (textEdges.size === 0) {
          return;
        }
        let rootStyles = "";
        if (defaultFont) {
          state.font.add(defaultFont);
        }
        state.font.forEach((fontName) => {
          rootStyles += getFontMetrics(fontName, textEdges);
        });
        if (!rootStyles) {
          return;
        }
        const rootStyleRule = postcss.parse(`:root {\n${rootStyles}}`)
          .first as Rule;
        if (defaultFont && !state.rule.has(rootStyleRule)) {
          state.rule.set(rootStyleRule, defaultFont);
        }
        state.rule.forEach((font, rule) => {
          const definitions = new Set<string>();
          const fontName = font.toLowerCase();
          if (textEdges.has("text")) {
            definitions.add(
              `--text-box-trim-start-text: var(--font-${fontName}-text-box-trim-start-text);`
            );
            definitions.add(
              `--text-box-trim-end-text: var(--font-${fontName}-text-box-trim-end-text);`
            );
          }
          if (textEdges.has("cap")) {
            definitions.add(
              `--text-box-trim-start-cap: var(--font-${fontName}-text-box-trim-start-cap);`
            );
          }
          if (textEdges.has("ex")) {
            definitions.add(
              `--text-box-trim-start-ex: var(--font-${fontName}-text-box-trim-start-ex);`
            );
          }
          if (textEdges.has("alphabetic")) {
            definitions.add(
              `--text-box-trim-end-alphabetic: var(--font-${fontName}-text-box-trim-end-alphabetic);`
            );
          }
          rule.append([...definitions].join("\n  "));
        });

        root.append(rootStyleRule);
        root.append(
          `\n:root {\n${rootStyles}}\n:where(*) { font-family: inherit }`
        );
      },
      Declaration(node) {
        root = node.root();
        // Replace leading trim:
        if (node.prop === "text-box-trim") {
          replaceLeadingTrimNode(node);
          if (node.value === "both" || node.value === "start") {
            state.trim.add("start");
          }
          if (node.value === "both" || node.value === "end") {
            state.trim.add("end");
          }
        }
        // Replace text-box-edge:
        if (node.prop === "text-box-edge") {
          const { textOverEdge, textUnderEdge } = replaceTextEdgeNode(node);
          if (textOverEdge) {
            state.textOverEdge.add(textOverEdge);
          }
          if (textUnderEdge) {
            state.textUnderEdge.add(textUnderEdge);
          }
        }
        // Apply font metrics:
        if (node.prop === "font-family") {
          const font = getFirstFont(node);
          if (!font) {
            throw new Error("unsupported font " + node.value);
          }
          state.rule.set(node.parent!, font);
          state.font.add(font);
        }
      },
    };
  },
});

postcssLeadingTrim.postcss = true;
export default postcssLeadingTrim;
