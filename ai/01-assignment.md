# Role

You are an expert TypeScript developer, particularly skilled at building top-notch MCP servers. Your task is to create a `mermaider` MCP server that uses `mermaid` NPM package to validate and render Mermaid diagrams.

## Requirements

1. This MCP server MUST use `mermaid` package's TypeScript API, e.g. relevant exported functions, found in the `mermaid` module.
2. The server MUST implement two tools:
   1. `validate_syntax`: validates Mermaid diagram syntax only. Returns `true` result if syntax is correct or `false` result with the text content that includes the error message, from the underlying `mermaid` API call.
   Arguments:
      - `diagram_text`: Mermaid diagram source code as text, required.
   2. `render_diagram`: renders Mermaid diagram into an SVG format. Returns `true` result with rendered SVG as text content or `false` result and error text as content.
   Arguments:
      - `diagram_text`: Mermaid diagram source code as text, required.

## Instructions

### General

1. Always USE `context7` MCP to look up up-to-date packages documentation or help.
2. ALWAYS write unit-tests for any externally facing function.
3. ALWAYS USE `bun` as package manager and JavaScript/TypeScript runtime.
4. USE `@modelcontextprotocol/sdk` package to implement the `mermaider` MCP server functionality.
   6.1 NOTE: `@modelcontextprotocol/sdk` is `/modelcontextprotocol/typescript-sdk` `context7CompatibleLibraryID` in `context7` MCP.
5. ALWAYS write JSDoc comments for modules and exported functions.

### MCP protocol

YOU MUST abide by the [MCP protocol spec](https://modelcontextprotocol.io/specification/2025-03-26/server/tools) at ALL TIMES.

### Writing Code

1. PREFER defining types to using inlined types:
   - DO THIS:
     
     ```typescript
     /// Diagram type
     type Diagram = 'graph' | 'architecture' | 'erDiag'
     function render(diagramCode: string, diagramType: Diagram): string;
     ```

   - AVOID THIS:

   ```typescript
   function render(diagramCode: string, diagramType: 'graph' | 'architecture' | 'erDiag'): string;
   ```
2. USE modular structure, partition the code into separate logical modules, AVOID stuffing all the code into one module.

## Examples

### MCP server example

A simple MCP server, showcasing the use of `@modelcontextprotocol/sdk` package and the basics of MCP server structure:

```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP tools with parameters example

Note, this example focuses on tools definition, it omits due imports.

```typescript
// Simple tool with parameters
server.tool(
  "calculate-bmi",
  {
    weightKg: z.number(),
    heightM: z.number()
  },
  async ({ weightKg, heightM }) => ({
    content: [{
      type: "text",
      text: String(weightKg / (heightM * heightM))
    }]
  })
);

// Async tool with external API call
server.tool(
  "fetch-weather",
  { city: z.string() },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.text();
    return {
      content: [{ type: "text", text: data }]
    };
  }
);
```

## High-Level Implementation Plan

1. ONLY IF NOT ALREADY:
   1.1 Initialize TypeScript project. Use latest TypeScript version. Use `mermaider` as package name and `Vitaly Tomilin` as its author. Use `vitaly.tomilin+mermaider@gmail.com` as contact email.
   1.2 Initialize git repo.
2. Figure out and install necessary dependencies:
   - `mermaid` package is a MUST. Use the latest version of the package.
   - Other packages as required to support this MCP server's functionality.
3. Make initial commit.
4. Write the necessary `mermaider` MCP server code, complete with unit-tests.
5. Test the server. Iterate as necessary until the server works as required.