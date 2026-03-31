import { describe, expect, it } from "vitest";

import { createDependencyGraph } from "./graph-builder.js";

describe("createDependencyGraph", () => {
  it("creates normalized nodes and edges from module imports", () => {
    const graph = createDependencyGraph([
      {
        filePath: "src/routes/users.ts",
        imports: [{ kind: "import", specifier: "../services/users", isTypeOnly: false }]
      },
      {
        filePath: "src/services/users.ts",
        imports: []
      }
    ]);

    expect(graph.nodes.map((node) => node.id)).toEqual([
      "src/routes/users",
      "src/services/users"
    ]);
    expect(graph.edges).toEqual([
      {
        id: "src/routes/users.ts->src/services/users",
        source: "src/routes/users",
        target: "src/services/users",
        type: "imports",
        metadata: { specifier: "../services/users" }
      }
    ]);
  });
});
