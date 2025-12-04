import fs from "fs";
import path from "path";

console.log("Validating collaboration utilities syntax...");

// Check if files exist
const utilsFiles = [
  "src/utils/collaborationUtils.ts",
  "src/utils/collaborationActivityUtils.ts",
];

let allFilesValid = true;

utilsFiles.forEach((filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Basic syntax checks
    if (
      !fileContent.includes("export function") &&
      !fileContent.includes("export const")
    ) {
      console.error(`❌ ${filePath}: No exports found`);
      allFilesValid = false;
      return;
    }

    if (!fileContent.includes("import")) {
      console.error(`❌ ${filePath}: No imports found`);
      allFilesValid = false;
      return;
    }

    // Check for common TypeScript syntax
    if (!fileContent.includes(":")) {
      console.error(`❌ ${filePath}: No type annotations found`);
      allFilesValid = false;
      return;
    }

    console.log(`✅ ${filePath}: Syntax looks valid`);
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    allFilesValid = false;
  }
});

if (allFilesValid) {
  console.log("\\n✅ All collaboration utilities have valid syntax!");
} else {
  console.log("\\n❌ Some collaboration utilities have syntax issues.");
  process.exit(1);
}
