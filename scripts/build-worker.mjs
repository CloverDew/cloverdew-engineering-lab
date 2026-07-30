import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const cli = resolve(
  "node_modules",
  ".bin",
  process.platform === "win32"
    ? "opennextjs-cloudflare.cmd"
    : "opennextjs-cloudflare"
);

const build = spawnSync(cli, ["build"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (build.error) {
  throw build.error;
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

// 即使处于生产构建中，Next 16.2.12 仍会从 node-environment.js 加载仅供开发期使用的
// 文件日志器。OpenNext 1.20.2 会为 workerd 打包该模块，而其中顶层的 CommonJS fs/path
// require 会在 NODE_ENV 守卫把日志器变成空操作之前失败。
//
// 只从生成的生产处理器中移除日志器初始化逻辑。如果包的形状发生变化，标记和出现次数
// 守卫会有意以失败结束，从而避免此变通方案悄悄修补无关调用。
const handlerPath = resolve(
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs"
);
const marker = "require_console_file();";
const handler = readFileSync(handlerPath, "utf8");
const occurrences = handler.split(marker).length - 1;

if (occurrences === 0) {
  console.log("OpenNext Worker 不需要控制台文件日志器；无需修补。");
} else if (occurrences === 1) {
  writeFileSync(
    handlerPath,
    handler.replace(
      marker,
      "/* 生产环境 workerd：已省略开发期控制台文件日志器 */"
    )
  );
  console.log("已从 workerd 打包产物中移除开发期控制台文件日志器。");
} else {
  throw new Error(
    `预期至多一个控制台文件日志器初始化逻辑，实际找到 ${occurrences} 个。`
  );
}

// OpenNext 的处理器是中间态 Node 平台包。Wrangler 会执行必需的第二次打包，将 CommonJS
// Node 内置模块 require 转换为与 workerd 兼容的 ESM 模块。Sites 会直接上传归档后的入口点，
// 因此应归档 Wrangler 的输出，而不是中间态 Worker。
const bundleDir = mkdtempSync(join(tmpdir(), "cloverdew-worker-"));
const wrangler = resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler"
);

try {
  const bundle = spawnSync(
    wrangler,
    ["deploy", "--dry-run", "--outdir", bundleDir],
    {
      env: {
        ...process.env,
        WRANGLER_LOG_PATH: join(bundleDir, "wrangler-logs")
      },
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );

  if (bundle.error) {
    throw bundle.error;
  }

  if (bundle.status !== 0) {
    process.exit(bundle.status ?? 1);
  }

  copyFileSync(join(bundleDir, "worker.js"), resolve(".open-next", "worker.js"));
  copyFileSync(
    join(bundleDir, "worker.js.map"),
    resolve(".open-next", "worker.js.map")
  );
  console.log(
    "已用 Wrangler 打包产物替换中间态 OpenNext 入口点。"
  );
} finally {
  rmSync(bundleDir, { recursive: true, force: true });
}
