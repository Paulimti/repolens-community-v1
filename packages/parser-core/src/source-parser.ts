import { join } from "node:path";
import { Project, ScriptKind, ts } from "ts-morph";
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

function getScriptKindForPath(filePath: string) {
  if (filePath.endsWith(".ts")) {
    return ScriptKind.TS;
  }

  if (filePath.endsWith(".tsx")) {
    return ScriptKind.TSX;
  }

  if (filePath.endsWith(".jsx")) {
    return ScriptKind.JSX;
  }

  return ScriptKind.JS;
}

export function createRepositorySourceParser(
  rootPath: string,
  files: ScannedRepositoryFile[]
): RepositorySourceParser {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
      checkJs: false,
      target: ts.ScriptTarget.ES2022
    }
  });
  const sourceFiles = files
    .filter(isSupportedSourceFile)
    .map((file) => ({
      path: file.path,
      absolutePath: join(rootPath, file.path)
    }));

  for (const file of sourceFiles) {
    const existingSourceFile = project.addSourceFileAtPathIfExists(file.absolutePath);

    if (existingSourceFile) {
      continue;
    }

    project.createSourceFile(file.absolutePath, "", {
        overwrite: true,
        scriptKind: getScriptKindForPath(file.path)
      });
  }

  return {
    project,
    sourceFiles
  };
}
