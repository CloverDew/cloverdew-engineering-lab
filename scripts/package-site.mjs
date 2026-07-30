import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const archiveName = "site-build.tar.gz";
const archivePath = resolve(archiveName);
const packageMetadata = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
const requiredPaths = [
  ".open-next/worker.js",
  ".open-next/assets",
  ".openai/hosting.json",
  "wrangler.jsonc"
];

for (const path of requiredPaths) {
  if (!existsSync(resolve(path))) {
    throw new Error(
      `无法打包 ${packageMetadata.name}：缺少必需的构建产物：${path}`
    );
  }
}

rmSync(archivePath, { force: true });

const archive = spawnSync(
  "tar",
  [
    "-czf",
    archivePath,
    ".open-next",
    ".openai/hosting.json",
    "wrangler.jsonc"
  ],
  {
    env: {
      ...process.env,
      COPYFILE_DISABLE: "1"
    },
    stdio: "inherit"
  }
);

if (archive.error) {
  throw archive.error;
}

if (archive.status !== 0) {
  process.exit(archive.status ?? 1);
}

const sizeInMiB = (statSync(archivePath).size / 1024 / 1024).toFixed(2);
console.log(
  `已将 ${packageMetadata.name}@${packageMetadata.version} 打包为 ${archiveName}（${sizeInMiB} MiB）。`
);
