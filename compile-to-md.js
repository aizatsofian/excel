const fs = require("fs");
const path = require("path");

const outputFile = "full-code.md";
fs.writeFileSync(outputFile, "# 📦 Full Source Code\n\n");

function processDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDir(fullPath); // Rekursif masuk folder
    } else {
      const ext = path.extname(file).substring(1);
      const langMap = { html: "html", css: "css", js: "javascript", json: "json", md: "markdown", docx: "", pptx: "", doc: "" };
      const lang = langMap[ext] || "";

      try {
        const content = fs.readFileSync(fullPath, "utf8");
        fs.appendFileSync(outputFile, `## 📄 ${fullPath}\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`);
      } catch (e) {
        fs.appendFileSync(outputFile, `## 📄 ${fullPath}\n🛑 Cannot read binary file (e.g. .docx, .pptx)\n\n`);
      }
    }
  });
}

processDir(".");
console.log(`✅ Siap! Fail gabungan disimpan sebagai ${outputFile}`);
