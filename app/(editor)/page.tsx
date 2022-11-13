"use client";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useUpdatePreviewIframe } from "../preview/api";
import { cssLanguageExtension } from "./cssLanguageExtension";
import { useCodeFromQueryString, useCodeToQueryString } from "./queryString";

export default function App() {
  useMonacoCssWithLeadingTrim();
  const [initialCss, initialHtml] = useCodeFromQueryString();
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  useCodeToQueryString(css, html);
  const iframeRef = useUpdatePreviewIframe(css, html);
  return (
    <div className="grid">
      <div className="css-editor">
        <Editor
          height="100%"
          defaultLanguage="css"
          defaultValue={initialCss}
          theme="vs-dark"
          onChange={(value) => {
            if (value !== undefined) {
              setCss(value);
            }
          }}
        />
      </div>
      <div className="html-editor">
        <Editor
          height="100%"
          defaultLanguage="html"
          defaultValue={initialHtml}
          theme="vs-dark"
          onChange={(value) => {
            if (value !== undefined) {
              setHtml(value);
            }
          }}
        />
      </div>
      <iframe
        className="preview"
        style={{ height: "100%", width: "100%" }}
        ref={iframeRef}
        src={"/preview"}
      />
    </div>
  );
}

/**
 * Injects the leading-trim draft into
 * monacos autocomplete and linting
 */
const useMonacoCssWithLeadingTrim = () => {
  const monaco = useMonaco();
  useEffect(() => {
    if (!monaco) {
      return;
    }
    const options = { ...monaco.languages.css.cssDefaults.options };
    options.data = options.data || {};
    options.data.dataProviders = options.data.dataProviders || {};
    options.data.dataProviders["/"] = cssLanguageExtension;
    monaco.languages.css.cssDefaults.setOptions(options);
  }, [monaco]);
};
