import type {
  ExtractedApiEndpoint,
  GeneratedDocumentationDraft,
  LogicalModule,
  ModuleDependencyEdge,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";

export function generateArchitectureSummary(
  metadata: RepositoryDocumentationMetadata,
  modules: LogicalModule[],
  apiEndpoints: ExtractedApiEndpoint[],
  dependencies: ModuleDependencyEdge[]
): GeneratedDocumentationDraft {
  void metadata;
  void modules;
  void apiEndpoints;
  void dependencies;

  return {
    docType: "ARCHITECTURE_SUMMARY",
    title: "Architecture Summary",
    content: "# Architecture Summary\n",
    systemPrompt: "",
    userPrompt: ""
  };
}
