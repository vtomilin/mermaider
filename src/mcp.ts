import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Page } from "puppeteer-core";
import { z } from "zod";
import pkg from "../package.json" with { type: "json" };
import { verifyDiagramSyntax } from "./mermaider";

export default async function run(page: Page): Promise<void> {
  // Create MCP server
  const server = new McpServer({
    name: "mermaider",
    version: pkg.version,
  });

  server.tool(
    "validate_syntax",
    `
    Validates Mermaid diagram syntax.

    Returns:
    - Empty content result on success.
    - Tool call returns error result with error message in content.`,
    {
      diagram_code: z.string().describe("Mermaid diagram code"),
    },
    async ({ diagram_code }) => {
      const result = await page.evaluate(verifyDiagramSyntax, diagram_code);
      const isError = typeof result === "string";
      return {
        isError,
        content: [
          {
            type: "text",
            text: isError ? result : "",
          },
        ],
      };
    },
  );
  // Start the server
  const transport = new StdioServerTransport();
  // Trick to keep the browser/page context alive until the transport is closed
  const transportClosed = new Promise<void>((resolve) => {
    process.stdin.on("close", () => {
      console.error("MCP server transport closed gracefully.");
      resolve();
    });
    // Watch the parent process, exit once it exits
    const timer = setInterval(() => {
      try {
        process.kill(process.ppid, 0);
      } catch (error) {
        // Parent does not exist
        console.error("Parent process exited, shutting down...");
        clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
  await server.connect(transport);
  return transportClosed;
}
