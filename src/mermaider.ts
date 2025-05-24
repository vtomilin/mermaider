/**
 * MCP server entry point for mermaider.
 * Provides validate_syntax and render_diagram tools for Mermaid diagrams.
 * Uses @modelcontextprotocol/sdk for MCP server implementation.
 * @module mermaider
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mermaid from "mermaid";

/**
 * Validates Mermaid diagram syntax.
 * @param {string} diagram_text - Mermaid diagram source.
 * @returns {Promise<{ result: boolean, content?: string }>} Validation result.
 */
export async function validate_syntax(diagram_text: string): Promise<{ result: boolean; content?: string }> {
  try {
    await mermaid.parse(diagram_text);
    return { result: true };
  } catch (error: any) {
    return { result: false, content: error?.message || String(error) };
  }
}

/**
 * Renders a Mermaid diagram to SVG or PNG.
 * @param {string} diagram_text - Mermaid diagram source.
 * @param {string} output_format - Output format ("svg" | "png").
 * @returns {Promise<{ result: boolean, content?: string }>} Render result.
 */
export async function render_diagram(
  diagram_text: string,
  output_format: "svg" | "png"
): Promise<{ result: boolean; content?: string }> {
  try {
    const id = "mermaider-diagram";
    const { svg } = await mermaid.render(id, diagram_text);

    if (output_format === "svg") {
      return { result: true, content: svg };
    } else if (output_format === "png") {
      const sharp = await import("sharp");
      const pngBuffer = await sharp.default(Buffer.from(svg)).png().toBuffer();
      return { result: true, content: pngBuffer.toString("base64") };
    } else {
      return { result: false, content: "Unsupported format: " + output_format };
    }
  } catch (error: any) {
    return { result: false, content: error?.message || String(error) };
  }
}

// Supported output formats for render_diagram
const OUTPUT_FORMATS = ["svg", "png"] as const;

if (import.meta.main) {
  const server = new McpServer({
    name: "mermaider",
    version: "1.0.0",
  });

  server.registerTool(
    "validate_syntax",
    z.object({
      diagram_text: z.string().describe("Mermaid diagram source code as text"),
    }),
    async ({ diagram_text }) => {
      const result = await validate_syntax(diagram_text);
      if (result.result) {
        return { result: true, content: [{ type: "text", text: "Valid Mermaid diagram." }] };
      } else {
        return { result: false, content: [{ type: "text", text: result.content ?? "Unknown error" }] };
      }
    },
  );

  server.registerTool(
    "render_diagram",
    z.object({
      diagram_text: z.string().describe("Mermaid diagram source code as text"),
      output_format: z.enum(OUTPUT_FORMATS).describe("Output format: svg or png"),
    }),
    async ({ diagram_text, output_format }) => {
      const result = await render_diagram(diagram_text, output_format);
      if (result.result && output_format === "svg" && result.content) {
        return { result: true, content: [{ type: "text", text: result.content }] };
      } else if (result.result && output_format === "png" && result.content) {
        return { result: true, content: [{ type: "image", data: result.content, mimeType: "image/png" }] };
      } else {
        return { result: false, content: [{ type: "text", text: result.content ?? "Unknown error" }] };
      }
    },
  );

  server.connect(new StdioServerTransport());
}