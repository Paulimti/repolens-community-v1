import type {
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";

export function generateOnboardingGuide(
  metadata: RepositoryDocumentationMetadata
): GeneratedDocumentationDraft {
  void metadata;

  return {
    docType: "ONBOARDING_GUIDE",
    title: "Onboarding Guide",
    content: "# Onboarding Guide\n",
    systemPrompt: "",
    userPrompt: ""
  };
}
