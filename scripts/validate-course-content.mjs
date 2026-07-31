import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const moduleNames = [
  "content",
  "curriculum-meta",
  "flink-content",
  "curriculum"
];
const requiredFlinkBlockKinds = [
  "orientation",
  "misconception",
  "experiment",
  "mechanism",
  "api-decision",
  "implementation",
  "distributed-boundary",
  "checkpoint"
];

function fail(message) {
  throw new Error(`课程内容校验失败：${message}`);
}

function trackOf(lesson) {
  return lesson.track ?? "java-concurrency";
}

function compileModule(source, fileName) {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    },
    fileName
  }).outputText;

  return output
    .replace(
      /from\s+(["'])\.\/(content|curriculum-meta|flink-content)\1/g,
      'from "./$2.mjs"'
    )
    .replace(
      /from\s+(["'])@\/lib\/(content|curriculum-meta|flink-content)\1/g,
      'from "./$2.mjs"'
    );
}

const temporaryRoot = await mkdtemp(
  path.join(tmpdir(), "cloverdew-course-content-")
);

try {
  for (const moduleName of moduleNames) {
    const sourcePath = path.join(repositoryRoot, "lib", `${moduleName}.ts`);
    const source = await readFile(sourcePath, "utf8");
    const output = compileModule(source, sourcePath);
    await writeFile(
      path.join(temporaryRoot, `${moduleName}.mjs`),
      output,
      "utf8"
    );
  }

  const curriculumUrl = pathToFileURL(
    path.join(temporaryRoot, "curriculum.mjs")
  ).href;
  const { lessons } = await import(curriculumUrl);
  const flinkContentUrl = pathToFileURL(
    path.join(temporaryRoot, "flink-content.mjs")
  ).href;
  const { flinkModules } = await import(flinkContentUrl);

  if (!Array.isArray(lessons) || lessons.length === 0) {
    fail("聚合课程列表为空。");
  }

  const slugs = new Set();
  const ordersByTrack = new Map();

  for (const lesson of lessons) {
    const track = trackOf(lesson);
    const orderKey = `${track}:${lesson.week}`;

    if (!lesson.slug || slugs.has(lesson.slug)) {
      fail(`slug 缺失或重复：${lesson.slug || "(empty)"}`);
    }
    slugs.add(lesson.slug);

    if (ordersByTrack.has(orderKey)) {
      fail(
        `${track} 内课次 ${lesson.week} 重复：${ordersByTrack.get(orderKey)} 与 ${lesson.slug}`
      );
    }
    ordersByTrack.set(orderKey, lesson.slug);

    if (lesson.status === "published") {
      const blocks = lesson.learningBlocks ?? [];
      if (blocks.length === 0 && (lesson.sections ?? []).length === 0) {
        fail(`${lesson.slug} 已发布却没有正文。`);
      }

    }

    if (track !== "flink-mastery") {
      continue;
    }

    const blocks = lesson.learningBlocks ?? [];
    if (lesson.status === "published" && blocks.length < 8) {
      fail(`${lesson.slug} 不是深度课：学习单元少于 8 个。`);
    }

    const kinds = new Set(blocks.map((block) => block.kind));
    for (const requiredKind of requiredFlinkBlockKinds) {
      if (!kinds.has(requiredKind)) {
        fail(`${lesson.slug} 缺少 ${requiredKind} 学习单元。`);
      }
    }

    if (!blocks.some((block) => block.prediction)) {
      fail(`${lesson.slug} 缺少先做预测的环节。`);
    }
    if (
      !blocks.some((block) => block.kind === "checkpoint" && block.checkpoint)
    ) {
      fail(`${lesson.slug} 缺少带闭卷问题的 checkpoint 学习单元。`);
    }
    if (!blocks.some((block) => block.invariant)) {
      fail(`${lesson.slug} 缺少可检查的不变量。`);
    }
    if (!blocks.some((block) => block.trace?.length)) {
      fail(`${lesson.slug} 缺少机制执行轨迹。`);
    }
    if (!blocks.some((block) => block.apiOptions?.length)) {
      fail(`${lesson.slug} 缺少 API 或架构取舍。`);
    }

    const implementation = blocks.find(
      (block) => block.kind === "implementation"
    );
    if (!implementation?.task || !implementation.adversarialTest) {
      fail(`${lesson.slug} 的实现任务必须包含任务与对抗测试。`);
    }

    const boundary = blocks.find(
      (block) => block.kind === "distributed-boundary"
    );
    if (!boundary?.localGuarantee || !boundary.breaksWith) {
      fail(`${lesson.slug} 缺少本地保证与跨系统失效边界。`);
    }

    if ((lesson.references ?? []).length < 2) {
      fail(`${lesson.slug} 至少需要两条官方一手资料。`);
    }

    for (const reference of lesson.references ?? []) {
      if (
        !reference.href.startsWith("https://flink.apache.org/") &&
        !reference.href.startsWith(
          "https://nightlies.apache.org/flink/flink-docs-release-2.3/"
        ) &&
        !reference.href.startsWith(
          "https://github.com/apache/flink/blob/release-2.3/"
        ) &&
        !reference.href.startsWith(
          "https://github.com/apache/flink/tree/release-2.3"
        )
      ) {
        fail(`${lesson.slug} 使用了未锁定到 Flink 2.3 的资料：${reference.href}`);
      }
    }

    for (const [index, block] of blocks.entries()) {
      if (!block.code) {
        continue;
      }
      if (!block.codeKind) {
        fail(`${lesson.slug} 第 ${index + 1} 步的代码缺少 codeKind。`);
      }
      if (!block.runtime) {
        fail(`${lesson.slug} 第 ${index + 1} 步的代码缺少 runtime。`);
      }
      if (
        block.codeKind === "runnable" ||
        block.codeKind === "broken-runnable"
      ) {
        fail(
          `${lesson.slug} 第 ${index + 1} 步依赖 Flink 工程，不能宣称可由裸 javac 运行。`
        );
      }
    }
  }

  const flinkLessons = lessons.filter(
    (lesson) => trackOf(lesson) === "flink-mastery"
  );
  if (flinkLessons.length !== 12) {
    fail(`Flink 专精路径应包含 12 个模块，当前为 ${flinkLessons.length} 个。`);
  }
  const flinkWeeks = [...flinkLessons]
    .map((lesson) => lesson.week)
    .sort((left, right) => left - right);
  if (flinkWeeks.join(",") !== "1,2,3,4,5,6,7,8,9,10,11,12") {
    fail(`Flink 模块编号必须连续为 1–12，当前为 ${flinkWeeks.join(",")}。`);
  }
  if (!Array.isArray(flinkModules) || flinkModules.length !== 12) {
    fail(
      `Flink 路线元数据应包含 12 个模块，当前为 ${flinkModules?.length ?? 0} 个。`
    );
  }

  const flinkLessonSlugs = new Set(flinkLessons.map((lesson) => lesson.slug));
  for (const module of flinkModules) {
    if (!flinkLessonSlugs.has(module.lessonSlug)) {
      fail(`${module.id} 指向不存在的课程：${module.lessonSlug}`);
    }
    if (!module.question || !module.outcome || module.topics?.length < 3) {
      fail(`${module.id} 缺少核心问题、产出或至少三个主题。`);
    }
  }

  console.log(
    `课程内容校验通过：${lessons.length} 节课程，${flinkLessons.length} 个 Flink 深度模块，slug 与轨道课次均唯一。`
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
