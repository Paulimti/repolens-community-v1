import path from "node:path";

import type { FileMetadata, ModuleMetadata } from "@repolens/shared-types";

export function detectLogicalModules(files: FileMetadata[]): ModuleMetadata[] {
  return files
    .filter((file) => [".js", ".jsx", ".ts", ".tsx"].includes(file.extension))
    .map((file) => ({
      id: file.path.replace(/\.[^.]+$/, ""),
      name: path.basename(file.path, file.extension),
      filePath: file.path,
      directory: file.directory,
      type: "unknown" as const
    }))
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}
