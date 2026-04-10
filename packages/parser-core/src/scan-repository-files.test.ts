import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { scanRepositoryFiles } from "./scan-repository-files.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directoryPath) =>
      rm(directoryPath, { recursive: true, force: true })
    )
  );
});

describe("scanRepositoryFiles", () => {
  it("ignores generated directories", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "repolens-scan-"));
    tempDirectories.push(tempRoot);

    await mkdir(path.join(tempRoot, "src"), { recursive: true });
    await mkdir(path.join(tempRoot, "node_modules", "pkg"), { recursive: true });
    await writeFile(path.join(tempRoot, "src", "index.ts"), "export {};\n");
    await writeFile(
      path.join(tempRoot, "node_modules", "pkg", "index.js"),
      "module.exports = {};\n"
    );

    const files = await scanRepositoryFiles(tempRoot);

    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({
      path: "src/index.ts",
      extension: ".ts"
    });
    expect(files[0]?.sizeBytes).toBeGreaterThan(0);
  });
});
