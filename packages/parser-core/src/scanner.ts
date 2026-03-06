import { readdir } from "node:fs/promises";
import path from "node:path";

async function walkDirectory(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(absolutePath);
      }

      return [absolutePath];
    })
  );

  return nestedFiles.flat();
}

export async function scanRepositoryFiles(rootPath: string): Promise<string[]> {
  const absoluteRootPath = path.resolve(rootPath);
  const files = await walkDirectory(absoluteRootPath);

  return files
    .map((filePath) => path.relative(absoluteRootPath, filePath))
    .sort((left, right) => left.localeCompare(right));
}
