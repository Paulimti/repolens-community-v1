import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { extractSourceModuleMetadata } from "./extract-source-module-metadata.js";
import { scanRepositoryFiles } from "./scan-repository-files.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directoryPath) =>
      rm(directoryPath, { recursive: true, force: true })
    )
  );
});

describe("extractSourceModuleMetadata", () => {
  it("extracts imports and exports from parsed source files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "repolens-parser-"));
    tempDirectories.push(tempRoot);

    await writeFile(
      path.join(tempRoot, "module.ts"),
      [
        'import type { Request } from "express";',
        'import helper from "./helper.js";',
        "export const route = helper;",
        "export default function handler(_request: Request) {}"
      ].join("\n")
    );

    const files = await scanRepositoryFiles(tempRoot);
    const modules = extractSourceModuleMetadata(tempRoot, files);

    expect(modules).toEqual([
      {
        path: "module.ts",
        imports: [
          {
            moduleSpecifier: "express",
            kind: "static",
            isTypeOnly: true,
            defaultImport: null,
            namespaceImport: null,
            namedImports: ["Request"]
          },
          {
            moduleSpecifier: "./helper.js",
            kind: "static",
            isTypeOnly: false,
            defaultImport: "helper",
            namespaceImport: null,
            namedImports: []
          }
        ],
        exports: [
          {
            kind: "default",
            name: "default",
            moduleSpecifier: null,
            isTypeOnly: false
          },
          {
            kind: "named",
            name: "route",
            moduleSpecifier: null,
            isTypeOnly: false
          }
        ]
      }
    ]);
  });
});
