import type {
  DetectedStackEntry,
  ScannedRepositoryFile
} from "@repolens/shared-types";

export async function detectStack(
  rootPath: string,
  files: ScannedRepositoryFile[]
): Promise<DetectedStackEntry[]> {
  void rootPath;
  void files;

  return [];
}
