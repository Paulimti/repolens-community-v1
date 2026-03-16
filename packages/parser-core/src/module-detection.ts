import path from "node:path";

import type { FileMetadata, ModuleMetadata } from "@repolens/shared-types";

export function inferModuleType(filePath: string): ModuleMetadata["type"] {
  const normalizedPath = filePath.toLowerCase();

  if (
    normalizedPath.includes("/routes/") ||
    normalizedPath.includes("/api/") ||
    normalizedPath.endsWith(".route.ts") ||
    normalizedPath.endsWith(".route.js")
  ) {
    return "route";
  }

  if (
    normalizedPath.includes("/services/") ||
    normalizedPath.endsWith(".service.ts") ||
    normalizedPath.endsWith(".service.js")
  ) {
    return "service";
  }

  if (
    normalizedPath.includes("/components/") ||
    normalizedPath.endsWith(".tsx") ||
    normalizedPath.endsWith(".jsx")
  ) {
    return "component";
  }

  return "unknown";
}

export function detectLogicalModules(files: FileMetadata[]): ModuleMetadata[] {
  return files
    .filter((file) => [".js", ".jsx", ".ts", ".tsx"].includes(file.extension))
    .map((file) => ({
      id: file.path.replace(/\.[^.]+$/, ""),
      name: path.basename(file.path, file.extension),
      filePath: file.path,
      directory: file.directory,
      type: inferModuleType(file.path)
    }))
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}
