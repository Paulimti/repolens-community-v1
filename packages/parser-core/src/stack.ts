import type {
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
