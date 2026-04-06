export type DocumentationPromptTemplate = {
  key: "project_overview" | "onboarding_guide" | "architecture_summary";
  systemPrompt: string;
  userPrompt: string;
};

export function createProjectOverviewPromptTemplate(): DocumentationPromptTemplate {
  return {
    key: "project_overview",
    systemPrompt: "",
    userPrompt: ""
  };
}

export function createOnboardingGuidePromptTemplate(): DocumentationPromptTemplate {
  return {
    key: "onboarding_guide",
    systemPrompt: "",
    userPrompt: ""
  };
}

export function createArchitectureSummaryPromptTemplate(): DocumentationPromptTemplate {
  return {
    key: "architecture_summary",
    systemPrompt: "",
    userPrompt: ""
  };
}
