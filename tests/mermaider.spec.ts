import {expect, test} from 'bun:test';
import { verifyDiagramSyntax } from '@/mermaider';

test('mermaider: verifyDiagramSyntax', async () => {
    const diagramCode = `
    graph TD
        A[Start] --> B{Is it sunny?}
        B -- Yes --> C[Go outside]
        B -- No --> D[Stay inside]
        C --> E[Have fun!]
        D --> E
    `;
    const result = await verifyDiagramSyntax(diagramCode);
    expect(result).toBe(true);
});
test('mermaider: verifyDiagramSyntax with syntax error', async () => {
    const diagramCode = `
        graph TD
        A-->;
        B-->C;
        C-->D;
    `;
    const result = await verifyDiagramSyntax(diagramCode);
    expect(result).toBeString();
    expect(result).toMatch(/Syntax error/);
});
