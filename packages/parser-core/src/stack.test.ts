import { describe, expect, it } from "vitest";

import {
  detectFrameworksFromProjectStructure,
  detectStackFromPackageMetadata,
  normalizeStackDetectionResult
} from "./stack.js";

describe("stack detection", () => {
  it("merges package metadata and project structure for nextjs apps", () => {
    const packageStack = detectStackFromPackageMetadata({
      name: "next-app",
      packageManager: "npm@11.5.2",
      scripts: {},
      dependencies: ["next", "react", "typescript"],
      devDependencies: ["vitest"]
    });

    const structureStack = detectFrameworksFromProjectStructure([
      {
        path: "next.config.js",
        directory: ".",
        extension: ".js",
        size: 1,
        lastModifiedMs: 1
      },
      {
        path: "app/layout.tsx",
        directory: "app",
        extension: ".tsx",
        size: 1,
        lastModifiedMs: 1
      }
    ]);

    expect(normalizeStackDetectionResult(packageStack, structureStack)).toMatchObject({
      frameworks: ["next", "react"],
      languages: ["javascript", "typescript"],
      packageManagers: ["npm"],
      testing: ["vitest"]
    });
  });
});
