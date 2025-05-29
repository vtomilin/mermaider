import puppeteer, { type LaunchOptions, Browser, Page } from "puppeteer-core";
import url from "url";
import path from "path";
import type { ExternalDiagramDefinition, Mermaid } from "mermaid";

const MERMAID_MODULE = getMinimizedModulePath("mermaid");
const ZENUML_MODULE = getMinimizedModulePath("@mermaid-js/mermaid-zenuml");

/// Returns the path to the module based on its name or throws an error if the module cannot be resolved.
function getMinimizedModulePath(moduleName: string): string {
  const { name } = path.parse(moduleName);
  const modulePath = url.fileURLToPath(import.meta.resolve(moduleName));
  return path.resolve(path.dirname(modulePath), `${name}.min.js`);
}

/// Type definition for an asynchronous function that takes a Browser instance and returns a Promise of type R
type WithBrowserFn<R> = (browser: Browser) => Promise<R>;
/// Type definition for an asynchronous function that takes a Page instance and returns a Promise of type R
type WithPageFn<R> = (page: Page) => Promise<R>;

/**
 *
 * @param fn Executes given function in a Browser context
 * @param fn Function to execute in the browser context
 * @param launchOptions Puppeteer launch options
 * @returns Promise that resolves with the result of the function
 * @throws Error if the browser fails to launch
 */
export async function withBrowser<R>(
  fn: WithBrowserFn<R>,
  launchOptions?: LaunchOptions,
): Promise<R> {
  const browser = await puppeteer.launch(launchOptions);
  try {
    return await fn(browser);
  } finally {
    console.error("Closing browser...");
    await browser.close();
  }
}

export async function withPage<R>(
  fn: WithPageFn<R>,
  browser: Browser,
): Promise<R> {
  const page = await browser.newPage();
  page.on("console", (msg) => console.error("PAGE LOG:", msg.text()));
  await page.setContent(
    "<!DOCTYPE html><html><head><title>Mermaider</title></head><body></body></html>",
  );
  await Promise.all([
    page.addScriptTag({ path: ZENUML_MODULE }),
    page.addScriptTag({ path: MERMAID_MODULE }),
  ]);

  type GlobalThisWithZenUML = typeof globalThis & {
    "mermaid-zenuml": ExternalDiagramDefinition;
    mermaid: Mermaid;
  };
  await page.evaluate(async () => {
    const { mermaid, "mermaid-zenuml": zenuml } =
      globalThis as GlobalThisWithZenUML;
    await mermaid.registerExternalDiagrams([zenuml]);
  });
  try {
    console.error("Running MCP server in page context...");
    return await fn(page);
  } finally {
    console.error("Closing page...");
    await page.close();
  }
}
