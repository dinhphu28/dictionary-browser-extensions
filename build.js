const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  ensureDir(dest);

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copySpecificSrc(target) {
  const outDir = path.join(DIST, target);
  const srcDir = path.join(SRC, target);
  copyRecursive(srcDir, outDir);
}

function copySharedSrc(target) {
  const outDir = path.join(DIST, target);
  const srcDir = path.join(SRC, "share");
  copyRecursive(srcDir, outDir);
}

// function build(target, manifestFile) {
function build(target) {
  const outDir = path.join(DIST, target);
  console.log(`\n👉 Building ${target}`);

  cleanDir(outDir);

  copySharedSrc(target);
  copySpecificSrc(target);

  // copy manifest.json
  // fs.copyFileSync(
  //   path.join(ROOT, manifestFile),
  //   path.join(outDir, "manifest.json")
  // );

  console.log(`✅ ${target} ready: ${outDir}`);
}

ensureDir(DIST);

// build("chrome", "manifest.chrome.json");
// build("firefox", "manifest.firefox.json");
build("chrome");
build("firefox");

console.log("\n🎉 Build finished");
