import type {
  DetectedStackEntry,
  ScannedRepositoryFile
} from "@repolens/shared-types";

import { readFile } from "node:fs/promises";
import { join, posix } from "node:path";

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const CATEGORY_ORDER: Record<DetectedStackEntry["category"], number> = {
  language: 0,
  runtime: 1,
  framework: 2,
  database: 3,
  tooling: 4
};

async function readPackageManifest(
  rootPath: string,
  relativePath: string
): Promise<PackageManifest | null> {
  try {
    const contents = await readFile(join(rootPath, relativePath), "utf8");
    const normalizedContents = contents.replace(/^\uFEFF/, "");
    const parsedValue = JSON.parse(normalizedContents) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    return parsedValue as PackageManifest;
  } catch {
    return null;
  }
}

function hasFile(paths: Set<string>, matcher: (path: string) => boolean) {
  for (const path of paths) {
    if (matcher(path)) {
      return path;
    }
  }

  return null;
}

function addDetection(
  detections: Map<string, DetectedStackEntry>,
  entry: DetectedStackEntry
) {
  const key = `${entry.category}:${entry.name}`;

  if (!detections.has(key)) {
    detections.set(key, entry);
  }
}

export async function detectStack(
  rootPath: string,
  files: ScannedRepositoryFile[]
): Promise<DetectedStackEntry[]> {
  const detections = new Map<string, DetectedStackEntry>();
  const filePaths = new Set(files.map((file) => file.path));
  const packageJsonFiles = files
    .filter((file) => posix.basename(file.path) === "package.json")
    .map((file) => file.path);
  const manifests = await Promise.all(
    packageJsonFiles.map(async (path) => ({
      path,
      manifest: await readPackageManifest(rootPath, path)
    }))
  );
  const dependencyNames = new Set<string>();

  for (const { manifest } of manifests) {
    for (const section of [manifest?.dependencies, manifest?.devDependencies]) {
      if (!section) {
        continue;
      }

      for (const dependencyName of Object.keys(section)) {
        dependencyNames.add(dependencyName);
      }
    }
  }

  if (packageJsonFiles.length > 0) {
    const firstPackageJson = packageJsonFiles[0];

    if (!firstPackageJson) {
      return [];
    }

    addDetection(detections, {
      name: "Node.js",
      category: "runtime",
      evidence: firstPackageJson
    });
    addDetection(detections, {
      name: "JavaScript",
      category: "language",
      evidence: firstPackageJson
    });
  }

  const typeScriptEvidence =
    hasFile(filePaths, (path) => path.endsWith("tsconfig.json")) ??
    hasFile(filePaths, (path) => path.endsWith(".ts") || path.endsWith(".tsx"));

  if (typeScriptEvidence || dependencyNames.has("typescript")) {
    addDetection(detections, {
      name: "TypeScript",
      category: "language",
      evidence: typeScriptEvidence ?? "package.json"
    });
  }

  const fileSignals: Array<{
    name: string;
    category: DetectedStackEntry["category"];
    evidence: string | null;
  }> = [
    {
      name: "Python",
      category: "language",
      evidence: hasFile(
        filePaths,
        (path) => path === "pyproject.toml" || path === "requirements.txt"
      )
    },
    {
      name: "Go",
      category: "language",
      evidence: hasFile(filePaths, (path) => path === "go.mod")
    },
    {
      name: "Rust",
      category: "language",
      evidence: hasFile(filePaths, (path) => path === "Cargo.toml")
    },
    {
      name: "Ruby",
      category: "language",
      evidence: hasFile(filePaths, (path) => path === "Gemfile")
    },
    {
      name: "PHP",
      category: "language",
      evidence: hasFile(filePaths, (path) => path === "composer.json")
    },
    {
      name: "Java",
      category: "language",
      evidence: hasFile(
        filePaths,
        (path) =>
          path === "pom.xml" ||
          path === "build.gradle" ||
          path === "build.gradle.kts"
      )
    },
    {
      name: ".NET",
      category: "runtime",
      evidence: hasFile(
        filePaths,
        (path) => path.endsWith(".csproj") || path.endsWith(".sln")
      )
    },
    {
      name: "Django",
      category: "framework",
      evidence: hasFile(filePaths, (path) => path === "manage.py")
    },
    {
      name: "Docker",
      category: "tooling",
      evidence: hasFile(
        filePaths,
        (path) =>
          posix.basename(path) === "Dockerfile" ||
          path === "docker-compose.yml" ||
          path === "docker-compose.yaml" ||
          path === "compose.yml" ||
          path === "compose.yaml"
      )
    },
    {
      name: "Prisma",
      category: "database",
      evidence: hasFile(filePaths, (path) => path.endsWith("prisma/schema.prisma"))
    },
    {
      name: "Turborepo",
      category: "tooling",
      evidence: hasFile(filePaths, (path) => path === "turbo.json")
    },
    {
      name: "pnpm Workspaces",
      category: "tooling",
      evidence: hasFile(filePaths, (path) => path === "pnpm-workspace.yaml")
    }
  ];

  for (const signal of fileSignals) {
    if (!signal.evidence) {
      continue;
    }

    addDetection(detections, {
      name: signal.name,
      category: signal.category,
      evidence: signal.evidence
    });
  }

  const dependencySignals: Array<{
    dependencyName: string;
    name: string;
    category: DetectedStackEntry["category"];
  }> = [
    { dependencyName: "react", name: "React", category: "framework" },
    { dependencyName: "next", name: "Next.js", category: "framework" },
    { dependencyName: "vue", name: "Vue", category: "framework" },
    { dependencyName: "nuxt", name: "Nuxt", category: "framework" },
    { dependencyName: "@angular/core", name: "Angular", category: "framework" },
    { dependencyName: "svelte", name: "Svelte", category: "framework" },
    { dependencyName: "express", name: "Express", category: "framework" },
    { dependencyName: "@nestjs/core", name: "NestJS", category: "framework" },
    { dependencyName: "fastify", name: "Fastify", category: "framework" },
    { dependencyName: "koa", name: "Koa", category: "framework" },
    { dependencyName: "hono", name: "Hono", category: "framework" },
    { dependencyName: "vite", name: "Vite", category: "tooling" },
    { dependencyName: "tailwindcss", name: "Tailwind CSS", category: "tooling" },
    { dependencyName: "prisma", name: "Prisma", category: "database" },
    { dependencyName: "@prisma/client", name: "Prisma Client", category: "database" },
    { dependencyName: "drizzle-orm", name: "Drizzle ORM", category: "database" }
  ];

  for (const signal of dependencySignals) {
    if (!dependencyNames.has(signal.dependencyName)) {
      continue;
    }

    addDetection(detections, {
      name: signal.name,
      category: signal.category,
      evidence: "package.json"
    });
  }

  return Array.from(detections.values()).sort((left, right) => {
    const categoryDelta =
      CATEGORY_ORDER[left.category] - CATEGORY_ORDER[right.category];

    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return left.name.localeCompare(right.name);
  });
}
