import type {
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";

export function generateProjectOverview(
  metadata: RepositoryDocumentationMetadata
): GeneratedDocumentationDraft {
  void metadata;

  return {
    docType: "PROJECT_OVERVIEW",
    title: "Project Overview",
    content: "# Project Overview\n",
    systemPrompt: "",
    userPrompt: ""
  };
}
