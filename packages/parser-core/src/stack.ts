import type {
  FileMetadata,
  PackageDependencyMetadata,
  StackDetectionResult
} from "@repolens/shared-types";

export function detectStackFromPackageMetadata(
  packageMetadata: PackageDependencyMetadata | null
): StackDetectionResult {
  const dependencyNames = [
    ...(packageMetadata?.dependencies ?? []),
    ...(packageMetadata?.devDependencies ?? [])
  ];

  const languages = dependencyNames.includes("typescript")
    ? ["typescript", "javascript"]
    : ["javascript"];
  const runtimes = packageMetadata ? ["node"] : [];
  const frameworks = dependencyNames.filter((dependencyName) =>
    ["express", "next", "react", "vue", "nestjs"].includes(dependencyName)
  );
  const testing = dependencyNames.filter((dependencyName) =>
    ["jest", "vitest", "mocha", "playwright"].includes(dependencyName)
  );
  const packageManagers = packageMetadata?.packageManager
    ? [packageMetadata.packageManager.split("@")[0] ?? packageMetadata.packageManager]
    : [];

  return {
    languages,
    runtimes,
    frameworks,
    testing,
    packageManagers,
    metadataSources: packageMetadata ? ["package.json"] : []
  };
}

export function detectFrameworksFromProjectStructure(
  files: FileMetadata[]
): StackDetectionResult {
  const repositoryPaths = new Set(files.map((file) => file.path));
  const frameworks: string[] = [];
  const languages = files.some((file) => file.extension === ".ts" || file.extension === ".tsx")
    ? ["typescript", "javascript"]
    : ["javascript"];

  if (repositoryPaths.has("next.config.js") || repositoryPaths.has("next.config.mjs")) {
    frameworks.push("next");
  }

  if (
    repositoryPaths.has("app/layout.tsx") ||
    repositoryPaths.has("app/layout.jsx") ||
    repositoryPaths.has("pages/_app.tsx")
  ) {
    frameworks.push("react");
  }

  if (files.some((file) => file.path.includes("/routes/") || file.path.startsWith("routes/"))) {
    frameworks.push("express");
  }

  return {
    languages,
    runtimes: [],
    frameworks,
    testing: [],
    packageManagers: [],
    metadataSources: frameworks.length > 0 ? ["project-structure"] : []
  };
}
