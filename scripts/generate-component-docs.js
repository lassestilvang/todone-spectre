#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🧩 Generating component documentation...");

try {
  // Find all component files
  const componentsDir = path.join(__dirname, "..", "src", "components");
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((file) => file.endsWith(".tsx"));

  let componentDocsContent =
    "# Todone Component Documentation - Generated\n\n## Components\n\n";

  componentFiles.forEach((file) => {
    const componentName = file.replace(".tsx", "");
    componentDocsContent += `### ${componentName}\n\n- **File**: src/components/${file}\n- **Type**: React Component\n- **Status**: Implemented\n\n\`\`\`jsx\n<${componentName} />\n\`\`\`\n\n`;
  });

  // Add usage patterns
  componentDocsContent +=
    '## Usage Patterns\n\n### Basic Usage\n```jsx\n<Component prop1="value" prop2={data} />\n```\n\n### Advanced Usage\n```jsx\n<Component\n  prop1="value"\n  prop2={data}\n  onEvent={handler}\n  className="custom-class"\n/>\n```\n';

  // Write to file
  fs.writeFileSync("docs/component-generated.md", componentDocsContent);

  console.log("✅ Component documentation generated successfully!");
  console.log("📄 File: docs/component-generated.md");
} catch (error) {
  console.error("❌ Component documentation generation failed:", error.message);
  process.exit(1);
}
