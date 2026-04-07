import type {
  ExtractedApiEndpoint,
  GeneratedDocumentationDraft,
  LogicalModule,
  ModuleDependencyEdge,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";
import { createArchitectureSummaryPromptTemplate } from "./documentation-prompt-templates.js";

export function generateArchitectureSummary(
  metadata: RepositoryDocumentationMetadata,
  modules: LogicalModule[],
  apiEndpoints: ExtractedApiEndpoint[],
  dependencies: ModuleDependencyEdge[]
): GeneratedDocumentationDraft {
  const incomingCountByPath = new Map<string, number>();
  const outgoingCountByPath = new Map<string, number>();

  for (const dependency of dependencies) {
    outgoingCountByPath.set(
      dependency.sourcePath,
      (outgoingCountByPath.get(dependency.sourcePath) ?? 0) + 1
    );
    incomingCountByPath.set(
      dependency.targetPath,
      (incomingCountByPath.get(dependency.targetPath) ?? 0) + 1
    );
  }

  const countBy = <T,>(values: T[], getKey: (value: T) => string) => {
    const counts = new Map<string, number>();

    for (const value of values) {
      const key = getKey(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        return left.key.localeCompare(right.key);
      });
  };

  const moduleTypeCounts = countBy(modules, (module) => module.moduleType);
  const endpointFrameworkCounts = countBy(
    apiEndpoints,
    (endpoint) => endpoint.framework
  );
  const topConnectedModules = [...modules]
    .sort((left, right) => {
      const leftScore =
        (incomingCountByPath.get(left.path) ?? 0) +
        (outgoingCountByPath.get(left.path) ?? 0);
      const rightScore =
        (incomingCountByPath.get(right.path) ?? 0) +
        (outgoingCountByPath.get(right.path) ?? 0);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return left.path.localeCompare(right.path);
    })
    .slice(0, 8);

  const promptTemplate = createArchitectureSummaryPromptTemplate(metadata, {
    modules: modules.map((module) => ({
      path: module.path,
      logicalName: module.logicalName,
      moduleType: module.moduleType,
      incomingDependencyCount: incomingCountByPath.get(module.path) ?? 0,
      outgoingDependencyCount: outgoingCountByPath.get(module.path) ?? 0
    })),
    apiEndpoints: apiEndpoints.map((endpoint) => ({
      framework: endpoint.framework,
      method: endpoint.method,
      path: endpoint.path,
      sourcePath: endpoint.sourcePath,
      handlerName: endpoint.handlerName
    }))
  });

  return {
    docType: "ARCHITECTURE_SUMMARY",
    title: "Architecture Summary",
    content: [
      "# Architecture Summary",
      "",
      "## Module Landscape",
      ...(moduleTypeCounts.length > 0
        ? moduleTypeCounts.map(
            (entry) =>
              `- ${entry.key}: ${entry.count} module${entry.count === 1 ? "" : "s"}`
          )
        : ["- No modules were parsed from supported source files."]),
      "",
      "## API Surface",
      ...(endpointFrameworkCounts.length > 0
        ? endpointFrameworkCounts.map(
            (entry) =>
              `- ${entry.key}: ${entry.count} endpoint${entry.count === 1 ? "" : "s"}`
          )
        : ["- No API endpoint definitions were extracted."]),
      ...(apiEndpoints.length > 0
        ? apiEndpoints
            .slice(0, 12)
            .map(
              (endpoint) =>
                `- [${endpoint.framework}] ${endpoint.method} ${endpoint.path} -> ${endpoint.sourcePath}`
            )
        : []),
      "",
      "## Dependency Shape and Coupling Notes",
      `- Total dependency edges: ${dependencies.length}`,
      ...(topConnectedModules.length > 0
        ? topConnectedModules.map((module) => {
            const incoming = incomingCountByPath.get(module.path) ?? 0;
            const outgoing = outgoingCountByPath.get(module.path) ?? 0;

            return `- ${module.logicalName} (${module.path}) incoming=${incoming}, outgoing=${outgoing}`;
          })
        : ["- No internal module dependency edges were resolved."])
    ].join("\n"),
    systemPrompt: promptTemplate.systemPrompt,
    userPrompt: promptTemplate.userPrompt
  };
}
