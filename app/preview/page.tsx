"use client";
import { useEffect, useState } from "react";
import type { DocumentWithPreviewApi } from "./api";
import { processCss } from "./preprocessor";

export default function IframeContent() {
    const [html, setHtml] = useState("");
    const [css, setCss] = useState("");
    useEffect(() => {
        let currentPostCss: Promise<string> | null = null;
        const iframeDocument: DocumentWithPreviewApi = document;
        iframeDocument.previewApi = {
            setHtml,
            setCss: (newCss) => {
                const postCssResult = processCss(newCss); 
                currentPostCss = postCssResult;
                postCssResult.then((processedCss) => {
                    if (currentPostCss === postCssResult) {
                        setCss(processedCss);
                    }
                });
            },
        };
        return () => {
            currentPostCss = null;
            // @ts-ignore
            delete document._editor;
        }
    }, [setHtml, setCss])
    return <>
        <head>
            <title>Preview</title>
            <style dangerouslySetInnerHTML={{__html: css}} />
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"></link>
        </head>
        <body dangerouslySetInnerHTML={{__html: html}} />
    </>
}