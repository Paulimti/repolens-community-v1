export type ScannedRepositoryFile = {
  path: string;
  extension: string | null;
  sizeBytes: number;
};

export type StackCategory =
  | "language"
  | "runtime"
  | "framework"
  | "database"
  | "tooling";

export type DetectedStackEntry = {
  name: string;
  category: StackCategory;
  evidence: string;
};

export type SourceImport = {
  moduleSpecifier: string;
  kind: "static" | "dynamic";
  isTypeOnly: boolean;
  defaultImport: string | null;
  namespaceImport: string | null;
  namedImports: string[];
};

export type SourceExport = {
  kind: "named" | "default" | "reexport" | "export-all";
  name: string | null;
  moduleSpecifier: string | null;
  isTypeOnly: boolean;
};

export type ParsedSourceModuleMetadata = {
  path: string;
  imports: SourceImport[];
  exports: SourceExport[];
};

export type LogicalModuleType =
  | "route"
  | "component"
  | "hook"
  | "api"
  | "worker"
  | "test"
  | "config"
  | "script"
  | "service"
  | "library";

export type LogicalModule = ParsedSourceModuleMetadata & {
  logicalName: string;
  moduleType: LogicalModuleType;
};

export type ApiEndpointFramework = "EXPRESS" | "NEXTJS";

export type ExtractedApiEndpoint = {
  framework: ApiEndpointFramework;
  method: string;
  path: string;
  sourcePath: string;
  handlerName: string | null;
};

export type ModuleDependencyType = "STATIC" | "DYNAMIC" | "REEXPORT";

export type ModuleDependencyEdge = {
  sourcePath: string;
  targetPath: string;
  dependencyType: ModuleDependencyType;
  specifier: string;
  isTypeOnly: boolean;
};

export type GeneratedDocumentationType =
  | "PROJECT_OVERVIEW"
  | "ONBOARDING_GUIDE"
  | "ARCHITECTURE_SUMMARY";

export type GeneratedDocumentationDraft = {
  docType: GeneratedDocumentationType;
  title: string;
  content: string;
  systemPrompt: string;
  userPrompt: string;
};

export type RepositoryDocumentationMetadata = {
  repositoryFullName: string;
  repositoryUrl: string;
  defaultBranch: string | null;
  stack: DetectedStackEntry[];
  scannedFileCount: number;
  moduleCount: number;
  moduleDependencyCount: number;
  apiEndpointCount: number;
};

export type RepositoryArchitectureMetadata = {
  modules: Array<{
    path: string;
    logicalName: string;
    moduleType: string;
    incomingDependencyCount?: number;
    outgoingDependencyCount?: number;
  }>;
  apiEndpoints: Array<{
    framework: string;
    method: string;
    path: string;
    sourcePath: string;
    handlerName: string | null;
  }>;
};
