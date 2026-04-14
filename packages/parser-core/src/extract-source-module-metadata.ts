import type {
  ParsedSourceModuleMetadata,
  ScannedRepositoryFile,
  SourceExport,
  SourceImport
} from "@repolens/shared-types";
import { Node, SyntaxKind } from "ts-morph";

import { createRepositorySourceParser } from "./source-parser.js";

function extractImportsFromSourceFile(
  sourceFile: ReturnType<
    ReturnType<typeof createRepositorySourceParser>["project"]["getSourceFileOrThrow"]
  >
) {
  const imports: SourceImport[] = [];

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    imports.push({
      moduleSpecifier: importDeclaration.getModuleSpecifierValue(),
      kind: "static",
      isTypeOnly: importDeclaration.isTypeOnly(),
      defaultImport: importDeclaration.getDefaultImport()?.getText() ?? null,
      namespaceImport: importDeclaration.getNamespaceImport()?.getText() ?? null,
      namedImports: importDeclaration.getNamedImports().map((namedImport) =>
        namedImport.getName()
      )
    });
  }

  for (const callExpression of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )) {
    if (
      !Node.isImportExpression(callExpression.getExpression()) &&
      callExpression.getExpression().getKind() !== SyntaxKind.ImportKeyword
    ) {
      continue;
    }

    const [firstArgument] = callExpression.getArguments();

    if (!firstArgument || !Node.isStringLiteral(firstArgument)) {
      continue;
    }

    imports.push({
      moduleSpecifier: firstArgument.getLiteralValue(),
      kind: "dynamic",
      isTypeOnly: false,
      defaultImport: null,
      namespaceImport: null,
      namedImports: []
    });
  }

  return imports;
}

function deduplicateExports(exports: SourceExport[]) {
  const seen = new Set<string>();

  return exports.filter((entry) => {
    const key = [
      entry.kind,
      entry.name ?? "",
      entry.moduleSpecifier ?? "",
      String(entry.isTypeOnly)
    ].join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function extractExportsFromSourceFile(
  sourceFile: ReturnType<
    ReturnType<typeof createRepositorySourceParser>["project"]["getSourceFileOrThrow"]
  >
) {
  const exports: SourceExport[] = [];
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [name] of exportedDeclarations) {
    exports.push({
      kind: name === "default" ? "default" : "named",
      name,
      moduleSpecifier: null,
      isTypeOnly: false
    });
  }

  for (const exportDeclaration of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = exportDeclaration.getModuleSpecifierValue() ?? null;

    if (exportDeclaration.isNamespaceExport()) {
      exports.push({
        kind: "export-all",
        name: null,
        moduleSpecifier,
        isTypeOnly: exportDeclaration.isTypeOnly()
      });
      continue;
    }

    for (const namedExport of exportDeclaration.getNamedExports()) {
      exports.push({
        kind: "reexport",
        name: namedExport.getName(),
        moduleSpecifier,
        isTypeOnly: exportDeclaration.isTypeOnly()
      });
    }
  }

  if (sourceFile.getExportAssignments().length > 0) {
    exports.push({
      kind: "default",
      name: "default",
      moduleSpecifier: null,
      isTypeOnly: false
    });
  }

  return deduplicateExports(exports);
}

export function extractSourceModuleMetadata(
  rootPath: string,
  files: ScannedRepositoryFile[]
): ParsedSourceModuleMetadata[] {
  const parser = createRepositorySourceParser(rootPath, files);

  return parser.sourceFiles.flatMap((file) => {
    try {
      const sourceFile = parser.project.getSourceFileOrThrow(file.absolutePath);

      return [
        {
          path: file.path,
          imports: extractImportsFromSourceFile(sourceFile),
          exports: extractExportsFromSourceFile(sourceFile)
        }
      ];
    } catch {
      return [];
    }
  });
}
