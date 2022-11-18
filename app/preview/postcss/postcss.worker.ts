"use client";
import postcss from "postcss";
import postcssLeadingTrim from "./plugin/postcssLeadingTrim";
import { expose } from "use-worker-promise/register";

const compiler = postcss(
  postcssLeadingTrim({
    defaultFont: "roboto",
  })
);

let errorTimer: ReturnType<typeof setTimeout> | undefined;

export const processCss = (css: string) =>
  compiler.process(css, { from: undefined }).then(
    (result) => result.css,
    (e) => {
      clearInterval(errorTimer);
      errorTimer = setTimeout(() => {
        console.error(e);
      }, 500);
      return null;
    }
  );

expose(processCss);
