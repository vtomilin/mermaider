#!/usr/bin/env node

import type { Browser } from "puppeteer-core";
import run from "./mcp";
import { withBrowser, withPage } from "./runtime";
import readConfig from "./config";

const config = readConfig();
if (config instanceof Error) {
  console.error(config.message);

  process.exit(1);
}

withBrowser(async (browser: Browser) => {
  // This function will be executed in the browser context
  // Start the server
  return await withPage(run, browser);
}, config.launchOptions);
