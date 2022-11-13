import { useEffect, useRef } from "react";

export type PreviewApi = {
    setHtml: (html: string) => void;
    setCss: (css: string) => void;
}

export type DocumentWithPreviewApi = Document & {
    previewApi?: PreviewApi;
}

const updateEditor = (iframe: HTMLIFrameElement | null, { css, html }: { css: string, html: string }) => {
    const editor = getEditorFromIframe(iframe);
    if (!editor) return false;
    editor.setHtml(html);
    editor.setCss(css);
    return true;
}

const getEditorFromIframe = (iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    return (iframe.contentDocument as DocumentWithPreviewApi | undefined | null)?.previewApi;
}

export const useUpdatePreviewIframe = (css: string, html: string) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
        if (updateEditor(iframeRef.current, { css, html })) {
            return;
        }
        // If the iframe is not ready yet, wait for it to load
        const interval = setInterval(() => {
            if (updateEditor(iframeRef.current, { css, html })) {
                clearInterval(interval);
            }
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [html, css]);
    return iframeRef;
}

