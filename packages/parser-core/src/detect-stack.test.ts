import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { detectStack } from "./detect-stack.js";
import { scanRepositoryFiles } from "./scan-repository-files.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directoryPath) =>
      rm(directoryPath, { recursive: true, force: true })
    )
  );
});

describe("detectStack", () => {
  it("detects common nextjs framework combinations", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "repolens-stack-"));
    tempDirectories.push(tempRoot);

    await writeFile(
      path.join(tempRoot, "package.json"),
      JSON.stringify({
        dependencies: {
          next: "16.0.0",
          react: "19.2.0",
          tailwindcss: "4.0.0",
          typescript: "5.9.3"
        }
      })
    );
    await writeFile(path.join(tempRoot, "tsconfig.json"), "{}");
    await writeFile(path.join(tempRoot, "next.config.js"), "export default {};\n");

    const files = await scanRepositoryFiles(tempRoot);
    const stack = await detectStack(tempRoot, files);

    expect(stack.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        "Node.js",
        "JavaScript",
        "TypeScript",
        "Next.js",
        "React",
        "Tailwind CSS"
      ])
    );
  });

  it("detects modern full-stack libraries including astro, bun, and mongoose", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "repolens-stack-modern-"));
    tempDirectories.push(tempRoot);

    await writeFile(
      path.join(tempRoot, "package.json"),
      JSON.stringify({
        dependencies: {
          astro: "^4.0.0",
          mongoose: "^8.0.0"
        }
      })
    );
    await writeFile(path.join(tempRoot, "bun.lockb"), "");
    await writeFile(path.join(tempRoot, "biome.json"), "{}");

    const files = await scanRepositoryFiles(tempRoot);
    const stack = await detectStack(tempRoot, files);

    expect(stack.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(["Bun", "Astro", "Mongoose", "Biome"])
    );
  });
});
