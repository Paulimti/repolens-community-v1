const DEFAULT_IGNORED_SEGMENTS = [
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "vendor"
] as const;

export function shouldIgnoreRepositoryPath(repositoryPath: string): boolean {
  const normalizedPath = repositoryPath.replaceAll("\\", "/");

  return DEFAULT_IGNORED_SEGMENTS.some((segment) =>
    normalizedPath.split("/").includes(segment)
  );
}
