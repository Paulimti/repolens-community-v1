import { readdir, readFile } from "node:fs/promises";
import { extname, join, posix, relative } from "node:path";
import type { ScannedRepositoryFile } from "@repolens/shared-types";

type IgnoreRule = {
  negated: boolean;
  directoryOnly: boolean;
  anchored: boolean;
  hasSlash: boolean;
  pattern: RegExp;
};

const DEFAULT_IGNORE_RULES = [
  ".git/",
  ".hg/",
  ".svn/",
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  ".next/",
  ".nuxt/",
  ".svelte-kit/",
  ".turbo/",
  ".cache/",
  "tmp/",
  "temp/",
  "vendor/",
  "target/",
  ".idea/",
  ".vscode/",
  "__pycache__/",
  ".venv/",
  "venv/",
  ".DS_Store",
  "Thumbs.db"
];

function escapeRegExp(value: string) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(pattern: string) {
  return new RegExp(
    pattern
      .split("**")
      .map((segment) => escapeRegExp(segment).replace(/\\\*/g, "[^/]*"))
      .join(".*")
  );
}

function createIgnoreRule(rawPattern: string): IgnoreRule | null {
  const trimmedPattern = rawPattern.trim();

  if (!trimmedPattern || trimmedPattern.startsWith("#")) {
    return null;
  }

  const negated = trimmedPattern.startsWith("!");
  const withoutNegation = negated ? trimmedPattern.slice(1) : trimmedPattern;
  const directoryOnly = withoutNegation.endsWith("/");
  const normalizedPattern = withoutNegation
    .replace(/\/+$/, "")
    .replace(/\\/g, "/");

  if (!normalizedPattern) {
    return null;
  }

  const anchored = normalizedPattern.startsWith("/");
  const unanchoredPattern = anchored
    ? normalizedPattern.slice(1)
    : normalizedPattern;
  const hasSlash = unanchoredPattern.includes("/");
  const body = globToRegExp(unanchoredPattern).source;

  const source = anchored
    ? `^${body}$`
    : hasSlash
      ? `(?:^|.*/)${body}$`
      : `^${body}$`;

  return {
    negated,
    directoryOnly,
    anchored,
    hasSlash,
    pattern: new RegExp(source)
  };
}

async function readIgnoreFile(
  rootPath: string,
  fileName: string
): Promise<IgnoreRule[]> {
  try {
    const contents = await readFile(join(rootPath, fileName), "utf8");

    return contents
      .split(/\r?\n/)
      .map(createIgnoreRule)
      .filter((rule: IgnoreRule | null): rule is IgnoreRule => rule !== null);
  } catch {
    return [];
  }
}

async function loadIgnoreRules(rootPath: string) {
  const defaultRules = DEFAULT_IGNORE_RULES
    .map(createIgnoreRule)
    .filter((rule: IgnoreRule | null): rule is IgnoreRule => rule !== null);
  const gitIgnoreRules = await readIgnoreFile(rootPath, ".gitignore");
  const extraIgnoreRules = await readIgnoreFile(rootPath, ".ignore");

  return [...defaultRules, ...gitIgnoreRules, ...extraIgnoreRules];
}

function normalizeRelativePath(rootPath: string, absolutePath: string) {
  return relative(rootPath, absolutePath).split("\\").join("/");
}

function matchesRule(
  rule: IgnoreRule,
  relativePath: string,
  isDirectory: boolean
) {
  if (rule.directoryOnly && !isDirectory) {
    return false;
  }

  const basename = posix.basename(relativePath);
  const target = !rule.anchored && !rule.hasSlash ? basename : relativePath;

  return rule.pattern.test(target);
}

function isIgnored(
  rules: IgnoreRule[],
  relativePath: string,
  isDirectory: boolean
) {
  let ignored = false;

  for (const rule of rules) {
    if (!matchesRule(rule, relativePath, isDirectory)) {
      continue;
    }

    ignored = !rule.negated;
  }

  return ignored;
}

async function walkDirectory(
  rootPath: string,
  currentPath: string,
  rules: IgnoreRule[],
  files: ScannedRepositoryFile[]
) {
  const entries = await readdir(currentPath, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const absolutePath = join(currentPath, entry.name);
    const relativePath = normalizeRelativePath(rootPath, absolutePath);

    if (isIgnored(rules, relativePath, entry.isDirectory())) {
      continue;
    }

    if (entry.isDirectory()) {
      await walkDirectory(rootPath, absolutePath, rules, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const stats = await import("node:fs/promises").then(({ stat }) =>
      stat(absolutePath)
    );
    const extension = extname(entry.name);

    files.push({
      path: relativePath,
      extension: extension ? extension.toLowerCase() : null,
      sizeBytes: stats.size
    });
  }
}

export async function scanRepositoryFiles(rootPath: string) {
  const ignoreRules = await loadIgnoreRules(rootPath);
  const files: ScannedRepositoryFile[] = [];

  await walkDirectory(rootPath, rootPath, ignoreRules, files);

  return files.sort((left, right) => left.path.localeCompare(right.path));
}
