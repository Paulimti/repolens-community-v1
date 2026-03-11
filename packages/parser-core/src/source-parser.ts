import path from "node:path";

import { Project, type SourceFile } from "ts-morph";

const SUPPORTED_SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs"
]);

export function isSupportedSourceFile(filePath: string): boolean {
  return SUPPORTED_SOURCE_EXTENSIONS.has(path.extname(filePath));
}

export function createSourceProject(rootPath: string): Project {
  return new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      skipLibCheck: true
    },
    tsConfigFilePath: path.join(rootPath, "tsconfig.json"),
    useInMemoryFileSystem: false
  });
}

export function loadSourceFile(
  project: Project,
  rootPath: string,
  repositoryPath: string
): SourceFile | undefined {
  if (!isSupportedSourceFile(repositoryPath)) {
    return undefined;
  }

  const absolutePath = path.join(rootPath, repositoryPath);

  return project.addSourceFileAtPathIfExists(absolutePath);
}
