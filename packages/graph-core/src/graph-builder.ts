import path from "node:path";

import type {
  DependencyGraph,
  GraphEdge,
  GraphNode,
  SourceImport
} from "@repolens/shared-types";

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

export function createDependencyGraph(
  sourceFiles: SourceDependencyInput[]
): DependencyGraph {
  const edges = createDependencyEdgesFromImports(sourceFiles);
  const nodeMap = new Map<string, GraphNode>();

  for (const sourceFile of sourceFiles) {
    const nodeId = sourceFile.filePath.replace(/\.[^.]+$/, "");

    nodeMap.set(nodeId, {
      id: nodeId,
      type: "file",
      label: path.posix.basename(nodeId),
      filePath: sourceFile.filePath
    });
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.target)) {
      nodeMap.set(edge.target, {
        id: edge.target,
        type: "file",
        label: path.posix.basename(edge.target)
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()).sort((left, right) =>
      left.id.localeCompare(right.id)
    ),
    edges: edges.sort((left, right) => left.id.localeCompare(right.id))
  };
}
