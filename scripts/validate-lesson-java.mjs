import { spawnSync } from "node:child_process";
import { readFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const contentPath = path.join(repositoryRoot, "lib", "content.ts");
const shouldRun = process.argv.includes("--run");

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    timeout: 15_000,
    ...options
  });
}

function getPublicTypeName(code) {
  return code.match(
    /\bpublic\s+(?:(?:final|sealed|abstract)\s+)*(?:class|interface|record|enum)\s+([A-Za-z_$][\w$]*)/
  )?.[1];
}

function getFileName(block) {
  const publicTypeName = getPublicTypeName(block.code);
  if (publicTypeName) {
    return `${publicTypeName}.java`;
  }

  return block.codeLabel?.match(/([A-Za-z_$][\w$]*\.java)\b/)?.[1];
}

const javacVersion = runCommand("javac", ["--version"]);
if (javacVersion.status !== 0) {
  throw new Error(
    `无法执行 javac：${javacVersion.stderr || javacVersion.stdout}`
  );
}

const source = await readFile(contentPath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022
  },
  fileName: contentPath
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`;
const { lessons } = await import(moduleUrl);

const snippets = lessons
  .filter(
    (lesson) =>
      (lesson.track ?? "java-concurrency") === "java-concurrency" &&
      lesson.week >= 2 &&
      lesson.week <= 8
  )
  .flatMap((lesson) =>
    (lesson.learningBlocks ?? []).flatMap((block, index) =>
      block.code &&
      (block.codeKind === "runnable" ||
        block.codeKind === "broken-runnable")
        ? [{ block, index, lesson }]
        : []
    )
  );

const temporaryRoot = await mkdtemp(
  path.join(tmpdir(), "cloverdew-lesson-java-")
);
let validated = 0;
let skipped = 0;

try {
  for (const { block, index, lesson } of snippets) {
    if (block.code.includes("org.openjdk.jmh")) {
      skipped += 1;
      console.log(
        `SKIP week ${lesson.week} / step ${index + 1}: external JMH project`
      );
      continue;
    }

    const fileName = getFileName(block);
    if (!fileName) {
      throw new Error(
        `第 ${lesson.week} 周第 ${index + 1} 步缺少可推导的 Java 文件名`
      );
    }

    const snippetDirectory = path.join(
      temporaryRoot,
      `week-${lesson.week}-step-${index + 1}`
    );
    await mkdir(snippetDirectory, { recursive: true });
    const sourcePath = path.join(snippetDirectory, fileName);
    await writeFile(sourcePath, block.code, "utf8");

    const compile = runCommand(
      "javac",
      ["--release", "21", fileName],
      { cwd: snippetDirectory }
    );
    if (compile.status !== 0) {
      throw new Error(
        [
          `编译失败：第 ${lesson.week} 周第 ${index + 1} 步 ${fileName}`,
          compile.stdout,
          compile.stderr
        ]
          .filter(Boolean)
          .join("\n")
      );
    }

    if (shouldRun) {
      const mainClass = getPublicTypeName(block.code);
      if (!mainClass) {
        throw new Error(`${fileName} 没有可运行的 public 类型`);
      }

      const execution = runCommand(
        "java",
        ["-cp", snippetDirectory, mainClass],
        { cwd: snippetDirectory }
      );
      if (execution.status !== 0) {
        throw new Error(
          [
            `运行失败：第 ${lesson.week} 周第 ${index + 1} 步 ${mainClass}`,
            execution.stdout,
            execution.stderr,
            execution.error?.message
          ]
            .filter(Boolean)
            .join("\n")
        );
      }
    }

    validated += 1;
    console.log(
      `OK week ${lesson.week} / step ${index + 1}: ${fileName}`
    );
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(
  `${shouldRun ? "编译并运行" : "编译"}通过 ${validated} 个示例，跳过 ${skipped} 个需要外部依赖的示例。`
);
