import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PackageDependencyMetadata } from "@repolens/shared-types";

interface RawPackageJson {
  name?: string;
  version?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function parsePackageJson(
  rootPath: string
): Promise<PackageDependencyMetadata | null> {
  const packageJsonPath = path.join(rootPath, "package.json");
  const packageJsonContents = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageJsonContents) as RawPackageJson;

  return {
    ...(packageJson.name ? { name: packageJson.name } : {}),
    ...(packageJson.version ? { version: packageJson.version } : {}),
    ...(packageJson.packageManager
      ? { packageManager: packageJson.packageManager }
      : {}),
    scripts: packageJson.scripts ?? {},
    dependencies: Object.keys(packageJson.dependencies ?? {}).sort(),
    devDependencies: Object.keys(packageJson.devDependencies ?? {}).sort()
  };
}
