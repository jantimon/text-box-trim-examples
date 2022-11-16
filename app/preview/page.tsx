"use client";
import { useEffect, useState } from "react";
import type { DocumentWithPreviewApi } from "./api";
import { usePostCss } from "./postcss/usePostCss";

export default function IframeContent() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const processedCss = usePostCss(css);
  // Until the web worker has started processedCss will be set
  // to undefined
  const isReady = processedCss !== undefined;
  useEffect(() => {
    const iframeDocument: DocumentWithPreviewApi = document;
    iframeDocument.previewApi = {
      setHtml,
      setCss
    };
    return () => {
      // @ts-ignore
      delete document._editor;
    };
  }, [setHtml, setCss]);
  return (
    <>
      <head>
        <title>Preview</title>
        <style dangerouslySetInnerHTML={{ __html: isReady ? processedCss : "" }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto"
          rel="stylesheet"
        />
      </head>
      <body dangerouslySetInnerHTML={{ __html: isReady ? html : "" }} />
    </>
  );
}
