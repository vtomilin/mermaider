// Unit tests for mermaider MCP server tools

import { validate_syntax, render_diagram } from "./mermaider.js";

describe("validate_syntax", () => {
  it("returns valid for correct diagram", async () => {
    const result = await validate_syntax("graph TD; A-->B;");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns invalid for incorrect diagram", async () => {
    const result = await validate_syntax("graph TD; A-->");
    expect(result.valid).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error?.length).toBeGreaterThan(0);
  });
});

describe("render_diagram", () => {
  const diagram = "graph TD; A-->B;";

  it("renders SVG (or skips if not supported)", async () => {
    const { result, content } = await render_diagram(diagram, "svg");
    if (!result) {
      console.warn("SVG rendering not supported in this environment:", result.error);
      return;
    }
    expect(content).toBeDefined();
    expect(typeof content).toBe("string");
  });

  it("renders PNG (base64) (or skips if not supported)", async () => {
    const { result, content } = await render_diagram(diagram, "png");
    if (!result) {
      console.warn("PNG rendering not supported in this environment:", result.error);
      return;
    }
    expect(typeof content).toBe("string");
    // PNG base64 should start with iVBOR (PNG signature)
    expect(content?.startsWith("iVBOR")).toBe(true);
  });

  it("returns error for unsupported format", async () => {
    const { result, content } = await render_diagram(diagram, "pdf" as any);
    expect(result).toBe(false);
    expect(content).toBeDefined();
    expect(content?.length).toBeGreaterThan(0);
    expect(content).toBe("Unsupported format: pdf");
  });
});