import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import type { FileMetadata, RepositoryScanResult } from "@repolens/shared-types";

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

export async function collectFileMetadata(
  rootPath: string,
  repositoryPath: string
): Promise<FileMetadata> {
  const absolutePath = path.join(rootPath, repositoryPath);
  const fileStats = await stat(absolutePath);
  const extension = path.extname(repositoryPath);

  return {
    path: repositoryPath.replaceAll("\\", "/"),
    directory: path.dirname(repositoryPath).replaceAll("\\", "/"),
    extension,
    size: fileStats.size,
    lastModifiedMs: fileStats.mtimeMs
  };
}

export async function scanRepository(
  rootPath: string
): Promise<RepositoryScanResult> {
  const absoluteRootPath = path.resolve(rootPath);
  const files = await scanRepositoryFiles(absoluteRootPath);

  return {
    rootPath: absoluteRootPath,
    files: await Promise.all(
      files.map((repositoryPath) =>
        collectFileMetadata(absoluteRootPath, repositoryPath)
      )
    ),
    ignoredPaths: []
  };
}
