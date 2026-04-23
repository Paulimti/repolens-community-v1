import type { RepositoryAnalysisResult } from "@repolens/core";
import type { LogicalModuleType, StackCategory } from "@repolens/shared-types";

const stackCategoryOrder: StackCategory[] = [
  "language",
  "runtime",
  "framework",
  "database",
  "tooling"
];

type RepositoryOverviewJsonOutput = {
  title: "Repository Overview";
  repository: {
    name: string;
    url: string | null;
    defaultBranch: string | null;
  };
  detectedStack: Array<{
    category: StackCategory;
    entries: Array<{
      name: string;
      evidence: string;
    }>;
  }>;
  analysisSignals: {
    scannedFiles: number;
    parsedModules: number;
    moduleDependencies: number;
    apiEndpoints: number;
  };
  likelyEntryPoints: Array<{
    role: string;
    path: string;
    logicalName: string;
    endpoints: string[];
  }>;
  importantModules: Array<{
    logicalName: string;
    moduleType: LogicalModuleType;
    path: string;
    incomingDependencies: number;
    outgoingDependencies: number;
  }>;
};

function formatStackByCategory(result: RepositoryAnalysisResult): string[] {
  if (result.detectedStack.length === 0) {
    return ["- No stack signals were detected from package metadata or project structure."];
  }

  const entriesByCategory = new Map<StackCategory, string[]>();

  for (const entry of result.detectedStack) {
    const formattedEntry = `${entry.name} [evidence: ${entry.evidence}]`;
    const entries = entriesByCategory.get(entry.category) ?? [];
    entries.push(formattedEntry);
    entriesByCategory.set(entry.category, entries);
  }

  return stackCategoryOrder
    .filter((category) => (entriesByCategory.get(category)?.length ?? 0) > 0)
    .map((category) => {
      const entries = entriesByCategory.get(category) ?? [];
      return `- ${category}: ${entries.join(", ")}`;
    });
}

function getStackByCategory(result: RepositoryAnalysisResult) {
  const entriesByCategory = new Map<StackCategory, Array<{ name: string; evidence: string }>>();

  for (const entry of result.detectedStack) {
    const entries = entriesByCategory.get(entry.category) ?? [];
    entries.push({
      name: entry.name,
      evidence: entry.evidence
    });
    entriesByCategory.set(entry.category, entries);
  }

  return stackCategoryOrder
    .filter((category) => (entriesByCategory.get(category)?.length ?? 0) > 0)
    .map((category) => ({
      category,
      entries: entriesByCategory.get(category) ?? []
    }));
}

const moduleTypePriority: Record<LogicalModuleType, number> = {
  api: 6,
  route: 5,
  service: 4,
  component: 3,
  worker: 3,
  script: 3,
  config: 2,
  hook: 2,
  library: 1,
  test: 0
};

function formatLikelyEntryPoints(result: RepositoryAnalysisResult): string[] {
  const entryPoints = getLikelyEntryPoints(result);

  if (entryPoints.length === 0) {
    return ["- No likely entry points were inferred from the current analysis result."];
  }

  return entryPoints.map((entryPoint) => {
    const details = entryPoint.endpoints.length > 0
      ? ` -> ${entryPoint.endpoints.join(", ")}`
      : "";

    return `- ${entryPoint.role}: ${entryPoint.path} (${entryPoint.logicalName})${details}`;
  });
}

function getLikelyEntryPoints(result: RepositoryAnalysisResult) {
  const endpointMethodsByPath = new Map<string, string[]>();

  for (const endpoint of result.apiEndpoints) {
    const entries = endpointMethodsByPath.get(endpoint.sourcePath) ?? [];
    entries.push(`${endpoint.method} ${endpoint.path}`);
    endpointMethodsByPath.set(endpoint.sourcePath, entries);
  }

  return result.detectedModules
    .filter(
      (module) =>
        endpointMethodsByPath.has(module.path) ||
        ["route", "script", "worker", "config"].includes(module.moduleType)
    )
    .sort((left, right) => {
      const leftIsEndpoint = endpointMethodsByPath.has(left.path) ? 1 : 0;
      const rightIsEndpoint = endpointMethodsByPath.has(right.path) ? 1 : 0;

      if (rightIsEndpoint !== leftIsEndpoint) {
        return rightIsEndpoint - leftIsEndpoint;
      }

      return left.path.localeCompare(right.path);
    })
    .slice(0, 6)
    .map((module) => ({
      role: endpointMethodsByPath.has(module.path) ? "api" : module.moduleType,
      path: module.path,
      logicalName: module.logicalName,
      endpoints: endpointMethodsByPath.get(module.path) ?? []
    }));
}

function formatImportantModules(result: RepositoryAnalysisResult): string[] {
  const importantModules = getImportantModules(result);

  if (importantModules.length === 0) {
    return ["- No important modules were inferred from the current analysis result."];
  }

  return importantModules.map((module) => {
    return `- ${module.logicalName} [${module.moduleType}] ${module.path} (incoming=${module.incomingDependencies}, outgoing=${module.outgoingDependencies})`;
  });
}

function getImportantModules(result: RepositoryAnalysisResult) {
  const incomingCountByPath = new Map<string, number>();
  const outgoingCountByPath = new Map<string, number>();
  const endpointPaths = new Set(result.apiEndpoints.map((endpoint) => endpoint.sourcePath));

  for (const dependency of result.moduleDependencies) {
    outgoingCountByPath.set(
      dependency.sourcePath,
      (outgoingCountByPath.get(dependency.sourcePath) ?? 0) + 1
    );
    incomingCountByPath.set(
      dependency.targetPath,
      (incomingCountByPath.get(dependency.targetPath) ?? 0) + 1
    );
  }

  return [...result.detectedModules]
    .map((module) => {
      const incoming = incomingCountByPath.get(module.path) ?? 0;
      const outgoing = outgoingCountByPath.get(module.path) ?? 0;
      const endpointBonus = endpointPaths.has(module.path) ? 4 : 0;
      const score = incoming + outgoing + moduleTypePriority[module.moduleType] + endpointBonus;

      return {
        module,
        incoming,
        outgoing,
        score
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.incoming !== left.incoming) {
        return right.incoming - left.incoming;
      }

      if (right.outgoing !== left.outgoing) {
        return right.outgoing - left.outgoing;
      }

      return left.module.path.localeCompare(right.module.path);
    })
    .slice(0, 5)
    .map(({ module, incoming, outgoing }) => ({
      logicalName: module.logicalName,
      moduleType: module.moduleType,
      path: module.path,
      incomingDependencies: incoming,
      outgoingDependencies: outgoing
    }));
}

export function formatRepositoryOverviewForTerminal(
  result: RepositoryAnalysisResult
): string {
  return [
    "Repository Overview",
    "",
    "Repository",
    `- Name: ${result.documentationMetadata.repositoryFullName}`,
    `- URL: ${result.documentationMetadata.repositoryUrl || "Not specified"}`,
    `- Default branch: ${result.documentationMetadata.defaultBranch ?? "Not specified"}`,
    "",
    "Detected Stack",
    ...formatStackByCategory(result),
    "",
    "Analysis Signals",
    `- Scanned files: ${result.scannedFiles.length}`,
    `- Parsed modules: ${result.detectedModules.length}`,
    `- Module dependencies: ${result.moduleDependencies.length}`,
    `- API endpoints: ${result.apiEndpoints.length}`,
    "",
    "Likely Entry Points",
    ...formatLikelyEntryPoints(result),
    "",
    "Important Modules",
    ...formatImportantModules(result)
  ].join("\n");
}

export function formatGeneratedDocumentForTerminal(content: string): string {
  return content.replace(/^#{1,6}\s+/gm, "").trim();
}

export function formatRepositoryOverviewForJson(
  result: RepositoryAnalysisResult
): RepositoryOverviewJsonOutput {
  return {
    title: "Repository Overview",
    repository: {
      name: result.documentationMetadata.repositoryFullName,
      url: result.documentationMetadata.repositoryUrl || null,
      defaultBranch: result.documentationMetadata.defaultBranch
    },
    detectedStack: getStackByCategory(result),
    analysisSignals: {
      scannedFiles: result.scannedFiles.length,
      parsedModules: result.detectedModules.length,
      moduleDependencies: result.moduleDependencies.length,
      apiEndpoints: result.apiEndpoints.length
    },
    likelyEntryPoints: getLikelyEntryPoints(result),
    importantModules: getImportantModules(result)
  };
}
