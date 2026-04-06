import { posix } from "node:path";
import type {
  LogicalModule,
  LogicalModuleType,
  ParsedSourceModuleMetadata,
  ScannedRepositoryFile
} from "@repolens/shared-types";

import { extractSourceModuleMetadata } from "@repolens/parser-core";

const ROUTE_FILE_NAMES = new Set([
  "page",
  "layout",
  "route",
  "loading",
  "error",
  "not-found"
]);
const CONFIG_FILE_NAMES = new Set([
  "vite.config",
  "webpack.config",
  "rollup.config",
  "eslint.config",
  "prettier.config",
  "jest.config",
  "vitest.config",
  "babel.config",
  "tailwind.config",
  "postcss.config",
  "next.config"
]);

function getPathParts(filePath: string) {
  const extension = posix.extname(filePath);
  const normalizedPath = extension
    ? filePath.slice(0, -extension.length)
    : filePath;

  return normalizedPath.split("/");
}

function getLogicalName(filePath: string) {
  const parts = getPathParts(filePath);
  const lastPart = parts.at(-1);

  if (
    lastPart &&
    ["index", "page", "layout", "route", "loading", "error"].includes(lastPart) &&
    parts.length > 1
  ) {
    parts.pop();
  }

  return parts.filter((part) => part !== "src").join(".");
}

function isPascalCase(value: string) {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
}

function detectModuleType(module: ParsedSourceModuleMetadata): LogicalModuleType {
  const parts = getPathParts(module.path);
  const baseName = parts.at(-1) ?? "";
  const pathText = module.path.toLowerCase();
  const hasDefaultExport = module.exports.some((entry) => entry.kind === "default");
  const importsJsxRuntime = module.imports.some((entry) =>
    ["react", "preact"].includes(entry.moduleSpecifier)
  );

  if (
    baseName.endsWith(".test") ||
    baseName.endsWith(".spec") ||
    pathText.includes("/__tests__/")
  ) {
    return "test";
  }

  if (
    CONFIG_FILE_NAMES.has(baseName) ||
    baseName.endsWith(".config") ||
    pathText.includes("/config/")
  ) {
    return "config";
  }

  if (pathText.includes("/scripts/")) {
    return "script";
  }

  if (pathText.includes("/workers/") || pathText.includes("/worker/")) {
    return "worker";
  }

  if (
    pathText.includes("/api/") ||
    baseName === "server" ||
    baseName.endsWith("handler") ||
    baseName.endsWith("controller")
  ) {
    return "api";
  }

  if (pathText.includes("/hooks/") || baseName.startsWith("use")) {
    return "hook";
  }

  if (
    pathText.includes("/pages/") ||
    pathText.includes("/app/") ||
    ROUTE_FILE_NAMES.has(baseName)
  ) {
    return "route";
  }

  if (
    pathText.includes("/components/") ||
    (isPascalCase(baseName) && (importsJsxRuntime || hasDefaultExport))
  ) {
    return "component";
  }

  if (
    pathText.includes("/services/") ||
    pathText.includes("/stores/") ||
    pathText.includes("/state/") ||
    baseName.endsWith("service")
  ) {
    return "service";
  }

  return "library";
}

export function detectLogicalModules(
  rootPath: string,
  files: ScannedRepositoryFile[]
): LogicalModule[] {
  return extractSourceModuleMetadata(rootPath, files).map((module) => ({
    ...module,
    logicalName: getLogicalName(module.path),
    moduleType: detectModuleType(module)
  }));
}
