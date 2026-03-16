import path from "node:path";

import type { GraphEdge, SourceImport } from "@repolens/shared-types";

export interface SourceDependencyInput {
  filePath: string;
  imports: SourceImport[];
}

function resolveImportTarget(filePath: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.posix.join(path.posix.dirname(filePath), specifier);

  return basePath.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, "");
}

export function createDependencyEdgesFromImports(
  sourceFiles: SourceDependencyInput[]
): GraphEdge[] {
  return sourceFiles.flatMap((sourceFile) =>
    sourceFile.imports.flatMap((sourceImport) => {
      const target = resolveImportTarget(sourceFile.filePath, sourceImport.specifier);

      if (!target) {
        return [];
      }

      return [
        {
          id: `${sourceFile.filePath}->${target}`,
          source: sourceFile.filePath.replace(/\.[^.]+$/, ""),
          target,
          type: "imports" as const,
          metadata: {
            specifier: sourceImport.specifier
          }
        }
      ];
    })
  );
}
