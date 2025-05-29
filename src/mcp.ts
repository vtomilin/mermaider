import { verifyDiagramSyntax } from "./mermaider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Page } from "puppeteer-core";
import { z } from "zod";

export default async function run(page: Page): Promise<void> {
  // Create MCP server
  const server = new McpServer({
    name: "mermaider",
    version: "0.0.1",
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
    transport.onclose = () => {
      console.error("MCP server transport closed.");
      resolve();
    };
  });
  await server.connect(transport);
  await transportClosed;
}
