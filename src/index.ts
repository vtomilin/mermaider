#!/usr/bin/env node

import type { Browser } from "puppeteer-core";
import run from "./mcp";
import { withBrowser, withPage } from "./runtime";
import readConfig from "./config";

const config = readConfig();
if (config instanceof Error) {
  console.error(config.message);

  process.exit(-1);
}

try {
await withBrowser(async (browser: Browser) => {
    // This function will be executed in the browser context
    // Start the server
    console.error('Starting mermaider MCP...');
    return await withPage(run, browser);
  }, config.launchOptions);
} catch (error) {
  console.error('The mermaider MCP exited due to an error:', error);
  process.exit(-1);
}

console.error('Exited mermaider MCP.');
