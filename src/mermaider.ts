import type { Mermaid } from "mermaid";

type VerificationResult = boolean | string;

// mermaid.initialize({
//     startOnLoad: false,
//     // securityLevel: 'sandbox', // Use 'sandbox' for security, 'loose' for more lenient parsing
//     // securityLevel: 'loose', // Allow for more lenient parsing
// });

/**
 *
 * @param {*} diagramCode
 */
export async function verifyDiagramSyntax(
  diagramCode: string,
): Promise<VerificationResult> {
  try {
    // Parse the diagram code to check for syntax errors
    type GlobalThisWithMermaid = typeof globalThis & {
      mermaid: Mermaid;
    };
    const { mermaid } = globalThis as GlobalThisWithMermaid;
    const res = await mermaid.parse(diagramCode);
    return typeof res === "boolean" ? res : true;
  } catch (error: unknown) {
    // Handle the error and return a message
    // console.error("Syntax error in diagram code:", error);
    return `Syntax error: ${error}`;
  }
}
