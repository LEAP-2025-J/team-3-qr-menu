import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Fix relative imports without .js extension
  const fixedContent = content.replace(
    /from\s+["'](\.\/.+?)["']/g,
    (match, importPath) => {
      if (!importPath.endsWith(".js") && !importPath.includes("node_modules")) {
        return match.replace(importPath, importPath + ".js");
      }
      return match;
    }
  );

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.includes("node_modules") &&
      !file.includes(".git")
    ) {
      walkDirectory(filePath);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      fixImportsInFile(filePath);
    }
  }
}

console.log("Fixing imports...");
walkDirectory(__dirname);
console.log("Done!");
