import type {
  SourceExport,
  SourceImport,
  SourceSymbol
} from "@repolens/shared-types";
import { Node, SyntaxKind, type SourceFile } from "ts-morph";

export function extractImports(sourceFile: SourceFile): SourceImport[] {
  const staticImports = sourceFile.getImportDeclarations().map((declaration) => ({
    kind: "import" as const,
    specifier: declaration.getModuleSpecifierValue(),
    isTypeOnly: declaration.isTypeOnly()
  }));

  const requireImports = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .flatMap((node) => {
      if (node.getExpression().getText() !== "require") {
        return [];
      }

      const [firstArgument] = node.getArguments();
      const stringLiteral = firstArgument?.asKind(SyntaxKind.StringLiteral);

      if (!stringLiteral) {
        return [];
      }

      return [
        {
          kind: "require" as const,
          specifier: stringLiteral.getLiteralText(),
          isTypeOnly: false
        }
      ];
    });

  return [...staticImports, ...requireImports];
}

export function extractExports(sourceFile: SourceFile): SourceExport[] {
  const namedExports = sourceFile
    .getExportSymbols()
    .map((exportSymbol) => ({
      kind: "named" as const,
      name: exportSymbol.getName()
    }));

  if (sourceFile.getDefaultExportSymbol()) {
    return [...namedExports, { kind: "default", name: "default" }];
  }

  return namedExports;
}

export function extractSymbols(sourceFile: SourceFile): SourceSymbol[] {
  return sourceFile.getStatements().flatMap((statement) => {
    if ("getName" in statement && typeof statement.getName === "function") {
      const name = statement.getName();

      if (!name) {
        return [];
      }

      return [
        {
          name,
          kind: statement.getKindName(),
          isDefault: Node.isModifierable(statement)
            ? statement.hasModifier(SyntaxKind.DefaultKeyword)
            : false,
          isExported: Node.isModifierable(statement)
            ? statement.hasModifier(SyntaxKind.ExportKeyword)
            : false
        }
      ];
    }

    return [];
  });
}
