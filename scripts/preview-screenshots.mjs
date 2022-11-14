/// @ts-check
import puppeteer from 'puppeteer';
import { resolve, dirname } from 'path';
import { readFile, writeFile } from 'fs/promises';

const browserPromise = puppeteer.launch({ headless: false });

const rootDir = resolve(dirname(new URL(import.meta.url).pathname), "..");

// find all https://leading-trim.vercel.app/?c= markdown links in README.md
const readme = await readFile(resolve(rootDir, 'README.md'), 'utf-8');

// remove preview images for links
const readmeWithoutImages = readme.replace(/!\[.*\]\(preview-[^)]*\)/g, '');

// find all links
const links = readmeWithoutImages.matchAll(/\[(.*)\]\((https:\/\/leading-trim.vercel.app\/\?c=[^)]*)\)/g);
const filteredLinks = Array.from(links).filter(([_, alt]) => alt !== "playground");

const browser = await browserPromise;
const generatedImages = await Promise.all(filteredLinks.map(async ([match, alt, url]) => {
    const name = alt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const imageName = `preview-${name}.png`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1080 });
    await page.goto(url);
    await page.waitForFunction(
      () => {
        return new Promise((resolve) => {
           const interval = setInterval(() => {
            const content = document.querySelector("iframe")?.contentDocument?.querySelector("body > *");
            if (content) {
                clearInterval(interval);
                resolve(true);
            }
           }, 100);
        });
      },
    );
    const element = await page.$('iframe');
    const iframeClip = await page.$eval('iframe', (iframe) => {
        const bodyRect = iframe.contentDocument?.querySelector("body")?.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();
        return bodyRect ? { x: bodyRect.x + iframeRect.x, y: bodyRect.y + iframeRect.y, width: bodyRect.width, height: bodyRect.height } : null;
    })
    if (!element || !iframeClip) {
        throw new Error("no iframe");
    }
    await element.screenshot({ path: resolve(rootDir, imageName), clip: iframeClip });
    await page.close();
    return {match, alt, imageName, url};
}));

browser.close();

let result = readmeWithoutImages;
generatedImages.forEach(({alt, match, imageName, url}) => {
    result = result.replace(match, `[${alt}![${alt}](${imageName})](${url})`);
});

await writeFile(resolve(rootDir, 'README.md'), result);