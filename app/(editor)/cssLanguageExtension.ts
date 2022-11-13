import { languages } from "monaco-editor/esm/vs/editor/editor.api";

export const cssLanguageExtension: languages.css.CSSDataV1 = {
  version: 1,
  properties: [
    {
      name: "leading-trim",
      description:
        "Draft Leading Trim\nhttps://www.w3.org/TR/css-inline-3/#propdef-leading-trim",
      browsers: [],
      values: [
        { name: "normal" },
        { name: "start" },
        { name: "end" },
        { name: "both" },
      ],
      syntax: "normal | start | end | both",
    },
    {
      name: "text-edge",
      description:
        "Draft Text Edge\nhttps://www.w3.org/TR/css-inline-3/#propdef-text-edge",
      browsers: [],
      values: [
        { name: "leading" },
        { name: "text" },
        { name: "cap" },
        { name: "ex" },
        { name: "ideographic" },
        { name: "ideographic-ink" },
      ],
      syntax:
        "leading | [ text | cap | ex | ideographic | ideographic-ink ] [ text | alphabetic | ideographic | ideographic-ink ]",
    },
  ],
};
