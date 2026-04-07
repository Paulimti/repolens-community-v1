import { posix } from "node:path";
import { SUPPORTED_SOURCE_FILE_EXTENSIONS } from "@repolens/parser-core";
import type { LogicalModule, ModuleDependencyEdge } from "@repolens/shared-types";

function resolveTargetPath(
  sourcePath: string,
  specifier: string,
  existingPaths: Set<string>
) {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = posix.normalize(posix.join(posix.dirname(sourcePath), specifier));
  const candidates = [basePath];

  for (const extension of SUPPORTED_SOURCE_FILE_EXTENSIONS) {
    candidates.push(`${basePath}${extension}`);
    candidates.push(posix.join(basePath, `index${extension}`));
  }

  for (const candidate of candidates) {
    if (existingPaths.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function addEdge(
  edges: Map<string, ModuleDependencyEdge>,
  edge: ModuleDependencyEdge
) {
  const key = [
    edge.sourcePath,
    edge.targetPath,
    edge.dependencyType,
    edge.specifier
  ].join(":");
  const existingEdge = edges.get(key);

  if (!existingEdge) {
    edges.set(key, edge);
    return;
  }

  if (existingEdge.isTypeOnly && !edge.isTypeOnly) {
    edges.set(key, {
      ...existingEdge,
      isTypeOnly: false
    });
  }
}

export function buildModuleDependencies(modules: LogicalModule[]) {
  const existingPaths = new Set(modules.map((module) => module.path));
  const edges = new Map<string, ModuleDependencyEdge>();

  for (const module of modules) {
    for (const sourceImport of module.imports) {
      const targetPath = resolveTargetPath(
        module.path,
        sourceImport.moduleSpecifier,
        existingPaths
      );

      if (!targetPath) {
        continue;
      }

      addEdge(edges, {
        sourcePath: module.path,
        targetPath,
        dependencyType: sourceImport.kind === "dynamic" ? "DYNAMIC" : "STATIC",
        specifier: sourceImport.moduleSpecifier,
        isTypeOnly: sourceImport.isTypeOnly
      });
    }

    for (const sourceExport of module.exports) {
      if (
        sourceExport.kind !== "reexport" &&
        sourceExport.kind !== "export-all"
      ) {
        continue;
      }

      if (!sourceExport.moduleSpecifier) {
        continue;
      }

      const targetPath = resolveTargetPath(
        module.path,
        sourceExport.moduleSpecifier,
        existingPaths
      );

      if (!targetPath) {
        continue;
      }

      addEdge(edges, {
        sourcePath: module.path,
        targetPath,
        dependencyType: "REEXPORT",
        specifier: sourceExport.moduleSpecifier,
        isTypeOnly: sourceExport.isTypeOnly
      });
    }
  }

  return Array.from(edges.values());
}
