import { languages } from "monaco-editor/esm/vs/editor/editor.api";

export const cssLanguageExtension: languages.css.CSSDataV1 = {
  version: 1,
  properties: [
    {
      name: "text-box-trim",
      description:
        "Draft Text Box Trim\nhttps://www.w3.org/TR/css-inline-3/\nhttps://github.com/w3c/csswg-drafts/issues/3240",
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
      name: "text-box-edge",
      description:
        "Draft Text Edge\nhttps://www.w3.org/TR/css-inline-3/\nhttps://github.com/w3c/csswg-drafts/issues/3240",
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
        "normal | [ text | cap | ex | ideographic | ideographic-ink ] [ text | alphabetic | ideographic | ideographic-ink ]",
    },
  ],
};
