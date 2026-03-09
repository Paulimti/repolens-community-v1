import { readdir } from "node:fs/promises";
import path from "node:path";

import { shouldIgnoreRepositoryPath } from "./ignore.js";

async function walkDirectory(
  rootPath: string,
  directoryPath: string
): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directoryPath, entry.name);
      const repositoryPath = path.relative(rootPath, absolutePath);

      if (shouldIgnoreRepositoryPath(repositoryPath)) {
        return [];
      }

      if (entry.isDirectory()) {
        return walkDirectory(rootPath, absolutePath);
      }

      return [absolutePath];
    })
  );

  return nestedFiles.flat();
}

export async function scanRepositoryFiles(rootPath: string): Promise<string[]> {
  const absoluteRootPath = path.resolve(rootPath);
  const files = await walkDirectory(absoluteRootPath, absoluteRootPath);

  return files
    .map((filePath) => path.relative(absoluteRootPath, filePath))
    .sort((left, right) => left.localeCompare(right));
}
