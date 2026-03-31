import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";

import { extractExports, extractImports } from "./source-analysis.js";

describe("source analysis", () => {
  it("extracts imports and exports from typescript modules", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      "module.ts",
      [
        'import type { Request } from "express";',
        'import { helper } from "./helper";',
        'const fs = require("node:fs");',
        "export const route = helper;",
        "export default function handler(_request: Request) {}"
      ].join("\n")
    );

    expect(extractImports(sourceFile)).toEqual([
      { kind: "import", specifier: "express", isTypeOnly: true },
      { kind: "import", specifier: "./helper", isTypeOnly: false },
      { kind: "require", specifier: "node:fs", isTypeOnly: false }
    ]);

    expect(extractExports(sourceFile)).toEqual([
      { kind: "named", name: "default" },
      { kind: "named", name: "route" },
      { kind: "default", name: "default" }
    ]);
  });
});
