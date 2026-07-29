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

// Next 16.2.12 loads its development-only file logger from
// node-environment.js even in a production bundle. OpenNext 1.20.2 bundles
// that module for workerd, where its top-level CommonJS fs/path requires fail
// before the NODE_ENV guard can make the logger a no-op.
//
// Drop only the logger initializer from the generated production handler. The
// marker and occurrence guard intentionally fail closed if the bundle shape
// changes, so this workaround cannot silently patch an unrelated call.
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
  console.log("OpenNext worker does not require the console file logger; no patch needed.");
} else if (occurrences === 1) {
  writeFileSync(
    handlerPath,
    handler.replace(
      marker,
      "/* production workerd: development console file logger omitted */"
    )
  );
  console.log("Removed the development console file logger from the workerd bundle.");
} else {
  throw new Error(
    `Expected at most one console file logger initializer, found ${occurrences}.`
  );
}

// OpenNext's handler is an intermediate Node-platform bundle. Wrangler performs
// the required second bundling pass that turns CommonJS Node built-in requires
// into workerd-compatible ESM modules. Sites uploads the archived entrypoint
// directly, so archive the Wrangler output rather than the intermediate worker.
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
    "Replaced the intermediate OpenNext entrypoint with the Wrangler bundle."
  );
} finally {
  rmSync(bundleDir, { recursive: true, force: true });
}
