"use client";
import zip from "lz-string";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

// Should be dynamic - but should work for this demo
const delimiter = `<//>`;

/**
 * Writes the css and html to the url
 */
export const useCodeToQueryString = (css: string, html: string) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = zip.compressToEncodedURIComponent(
      `${css}${delimiter}${html}`
    );
    if (searchParams.get("c") !== query) {
      window.history.replaceState({}, document.title, `?c=${query}`);
    }
  }, [css, html]);
};

/**
 * Returns the css and html from the query string
 *
 * @usage
 * const [css, html] = useQueryStringToCode()
 */
export const useCodeFromQueryString = (): [string, string] => {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const decompresed =
      zip.decompressFromEncodedURIComponent(searchParams.get("c") || "") ||
      null;
    if (!decompresed) {
      return [
        "h1 {\n  leading-trim: both;\n  text-edge: cap alphabetic;\n}",
        "<h1>Leading Trim</h1>",
      ];
    }
    return decompresed.split(delimiter, 2) as [string, string];
  }, [searchParams]);
};
