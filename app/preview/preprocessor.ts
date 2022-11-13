"use client";
import postcss, { AcceptedPlugin, Rule } from "postcss";
import postcssNesting from 'postcss-nesting';

const robotto = {
    top: `-0.1641em`,
    bottom: `-0.222em`,
}

const plugins: AcceptedPlugin[] = [
    {
        postcssPlugin: 'postcss-leading-trim',
        Declaration(node) {
            const parent = node.parent;
            if (node.prop !== "leading-trim" || !parent) {
                return;
            }
            const start = `
                &:before {
                    content: '';
                    margin-bottom: ${robotto.top};
                    display: table;
                }
            `;
            const end = `
                &:after {
                    content: '';
                    margin-top: ${robotto.bottom};
                    display: table;
                }
            `;
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
        }
    },
    postcssNesting(),
]

export const processCss = (css: string) => postcss(plugins)
    .process(css, { from: undefined })
    .then((result) => result.css, () => "")