import { Project } from "ts-morph";
import type { ScannedRepositoryFile } from "@repolens/shared-types";

export const SUPPORTED_SOURCE_FILE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts"
]);

export type RepositorySourceFile = {
  path: string;
  absolutePath: string;
};

export type RepositorySourceParser = {
  project: Project;
  sourceFiles: RepositorySourceFile[];
};

export function isSupportedSourceFile(file: ScannedRepositoryFile) {
  return (
    file.extension !== null &&
    SUPPORTED_SOURCE_FILE_EXTENSIONS.has(file.extension)
  );
}

export function createRepositorySourceParser(
  rootPath: string,
  files: ScannedRepositoryFile[]
): RepositorySourceParser {
  void rootPath;
  void files;

  return {
    project: new Project(),
    sourceFiles: []
  };
}
