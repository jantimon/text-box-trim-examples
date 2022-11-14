"use client";
import postcss, { AcceptedPlugin, Rule, Declaration } from "postcss";
import postcssNesting from "postcss-nesting";

const roboto = {
  leading: {
    top: `0px`,
    bottom: `0px`,
  },
  cap: {
    top: `-0.211em`,
    bottom: null,
  },
  alphabetic: {
    top: null,
    bottom: `-0.242em`,
  },
  text: {
    top: `-0.0141em`,
    bottom: `-0.05em`,
  },
  ex: {
    top: `-0.391em`,
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

const rootStyles = `:root {
  --leading-trim-start: ${roboto.leading.top};
  --leading-trim-end: ${roboto.leading.bottom};
}`;

const textOverEdgeValues = [
  "leading",
  "text",
  "cap",
  "ex",
  "ideographic",
  "ideographic-ink",
] as const;
const textUnderEdgeValues = [
  "leading",
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
  const top = textOverEdge && roboto[textOverEdge].top;
  const bottom = textUnderEdge && roboto[textUnderEdge].bottom;

  const topValue = !top ? "" : `--leading-trim-start: ${top};`;
  const bottomValue = !bottom ? "" : `--leading-trim-end: ${bottom};`;
  const replacement = topValue + bottomValue;
  console.log(textOverEdge, textUnderEdgeValue, textUnderEdge, replacement);
  node.replaceWith(postcss.parse(`& { ${replacement} }`).first as Rule);
};

const replaceLeadingTrimNode = (node: Declaration) => {
  const parent = node.parent;
  if (!parent) {
    return;
  }
  const start = `
    &:before {
        content: '';
        margin-bottom: var(--leading-trim-start);
        display: table;
    }`;
  const end = `
    &:after {
        content: '';
        margin-top: var(--leading-trim-end);
        display: table;
    }`;
  let replacement = "";
  switch (node.value) {
    case "start":
      replacement = start;
      break;
    case "end":
      replacement = end;
      break;
    case "both":
      replacement = start + end;
      break;
    default:
  }
  node.replaceWith(postcss.parse(`& { ${replacement} }`).first as Rule);
};

const plugins: AcceptedPlugin[] = [
  {
    postcssPlugin: "postcss-leading-trim",
    Declaration(node) {
      // Replace leading trim:
      if (node.prop === "leading-trim") {
        replaceLeadingTrimNode(node);
      }
      // Replace text-edge:
      if (node.prop === "text-edge") {
        replaceTextEdgeNode(node);
      }
    },
  },
  postcssNesting(),
];

export const processCss = (css: string) =>
  postcss(plugins)
    .process(css, { from: undefined })
    .then(
      (result) => rootStyles + result.css,
      (e) => {
        console.error(e);
        return "";
      }
    );
