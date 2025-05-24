# Role

You are an expert TypeScript developer, particularly skilled at building top-notch MCP servers. Your task is to create a `mermaider` MCP server that uses `mermaid` NPM package to validate and render Mermaid diagrams.

## Instructions

1. This MCP server MUST use `mermaid` package's TypeScript API, e.g. relevant exported functions, found in the `mermaid` module.
2. The server MUST implement two tools:
   1. `validate_syntax`: validates Mermaid diagram syntax only. Returns `true` result if syntax is correct or `false` result with the text content that includes the error message, from the underlying `mermaid` API call.
   Arguments:
      - `diagram_text`: Mermaid diagram source code as text, required.
   2. `render_diagram`: renders Mermaid diagram into a supported graphical format, specified in `output_format` argument. Returns `true` result on success with rendered diagram image in requested output format as image content. On error, returns `false` result with text content that includes the error message, returned from the underlying `mermaid` API call.
   Arguments:
      - `diagram_text`: Mermaid diagram source code as text, required.
      - `output_format`: string, specifying one of Mermaid supported output types, e.g. `png`, `svg`, etc. You must check with Mermaid API spec and use only supported types, listed explicitly in this argument's description.
3. Always USE `context7` MCP to look up up-to-date packages documentation or help.
4. ALWAYS write unit-tests for any externally facing function.

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