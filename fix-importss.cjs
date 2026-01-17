const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

function getRelativeImport(filePath, target) {
  const fromDir = path.dirname(filePath);
  let relativePath = path.relative(fromDir, target);
  if (!relativePath.startsWith(".")) {
    relativePath = "./" + relativePath;
  }
  return relativePath.replace(/\\/g, "/");
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf-8");

      content = content.replace(/@\/lib\/([\w/-]+)/g, (_, p1) => {
        const target = path.join(srcDir, "lib", p1);
        return getRelativeImport(fullPath, target);
      });

      content = content.replace(/@\/hooks\/([\w/-]+)/g, (_, p1) => {
        const target = path.join(srcDir, "hooks", p1);
        return getRelativeImport(fullPath, target);
      });

      content = content.replace(/@\/components\/([\w/-]+)/g, (_, p1) => {
        const target = path.join(srcDir, "components", p1);
        return getRelativeImport(fullPath, target);
      });

      content = content.replace(/@shared\/([\w/-]+)/g, (_, p1) => {
        const target = path.join(srcDir, "lib", p1);
        return getRelativeImport(fullPath, target);
      });

      fs.writeFileSync(fullPath, content, "utf-8");
    }
  });
}

walk(srcDir);
console.log("Tous les imports @/... et @shared/... ont été corrigés !");
