import type {
  DetectedStackEntry,
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata,
  ScannedRepositoryFile
} from "@repolens/shared-types";

type AnalyzeRepositoryInput = {
  rootPath: string;
  repositoryFullName: string;
  repositoryUrl: string;
  defaultBranch: string | null;
};

export type RepositoryAnalysisSnapshot = {
  detectedModules: [];
  apiEndpoints: [];
  moduleDependencies: [];
  documentationMetadata: RepositoryDocumentationMetadata;
  generatedDocs: GeneratedDocumentationDraft[];
};

type AnalyzeRepositorySnapshotInput = AnalyzeRepositoryInput & {
  scannedFiles: ScannedRepositoryFile[];
  detectedStack: DetectedStackEntry[];
};

export type RepositoryAnalysisResult = RepositoryAnalysisSnapshot & {
  scannedFiles: ScannedRepositoryFile[];
  detectedStack: DetectedStackEntry[];
};

export function analyzeRepositorySnapshot({
  repositoryFullName,
  repositoryUrl,
  defaultBranch,
  scannedFiles,
  detectedStack
}: AnalyzeRepositorySnapshotInput): RepositoryAnalysisSnapshot {
  return {
    detectedModules: [],
    apiEndpoints: [],
    moduleDependencies: [],
    documentationMetadata: {
      repositoryFullName,
      repositoryUrl,
      defaultBranch,
      stack: detectedStack,
      scannedFileCount: scannedFiles.length,
      moduleCount: 0,
      moduleDependencyCount: 0,
      apiEndpointCount: 0
    },
    generatedDocs: []
  };
}

export async function analyzeRepository(
  input: AnalyzeRepositoryInput
): Promise<RepositoryAnalysisResult> {
  const snapshot = analyzeRepositorySnapshot({
    ...input,
    scannedFiles: [],
    detectedStack: []
  });

  return {
    scannedFiles: [],
    detectedStack: [],
    ...snapshot
  };
}
