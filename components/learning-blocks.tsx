import { CopyCode } from "@/components/copy-code";
import type { LessonLearningBlock } from "@/lib/content";

type TextContent = string | readonly string[];

const learningBlockLabels = {
  orientation: "定位图",
  misconception: "反例",
  experiment: "实验",
  mechanism: "机制",
  "api-decision": "API 选型",
  implementation: "动手实现",
  "distributed-boundary": "分布式边界",
  checkpoint: "检查点"
} as const;

const codeKindLabels: Record<string, string> = {
  runnable: "可运行",
  "broken-runnable": "可运行的错误示例",
  excerpt: "代码节选",
  pseudocode: "伪代码"
};

export function getLearningBlockId(index: number) {
  return `learning-step-${index + 1}`;
}

export function getLearningBlockKindLabel(kind: LessonLearningBlock["kind"]) {
  return learningBlockLabels[kind];
}

function getLearningBlockEyebrow(block: LessonLearningBlock) {
  return (
    block.eyebrow.replace(/^第\s*\d+\s*步\s*[·.。]\s*/, "").trim() ||
    getLearningBlockKindLabel(block.kind)
  );
}

export function getLearningBlockNavigationLabel(block: LessonLearningBlock) {
  return getLearningBlockEyebrow(block);
}

function toLines(content?: TextContent) {
  if (!content) {
    return [];
  }

  return typeof content === "string" ? [content] : [...content];
}

function Paragraphs({
  content,
  className
}: {
  content?: TextContent;
  className?: string;
}) {
  return toLines(content).map((paragraph, index) => (
    <p className={className} key={`${index}-${paragraph}`}>
      {paragraph}
    </p>
  ));
}

function BulletList({
  items,
  className
}: {
  items?: readonly string[];
  className?: string;
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function CodeBlock({
  code,
  label,
  codeKind
}: {
  code: string;
  label: string;
  codeKind?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{label}</span>
        {codeKind && <span className="code-kind">{codeKind}</span>}
        <CopyCode code={code} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function detailLooksLikeCode(content: TextContent) {
  const text = toLines(content).join("\n");
  return /(^|\n)\s*(?:public|private|protected|final|class|interface|enum|static|void|return)\b|[{};]/m.test(
    text
  );
}

function DetailContent({
  content,
  codeLabel = "完整实现"
}: {
  content: TextContent;
  codeLabel?: string;
}) {
  const lines = toLines(content);

  if (detailLooksLikeCode(content)) {
    const code = lines.join("\n");
    return <CodeBlock code={code} label={codeLabel} />;
  }

  return <Paragraphs className="learning-detail-copy" content={lines} />;
}

function getCodeLabel(block: LessonLearningBlock) {
  const runtime = block.javaVersion
    ? block.javaVersion.startsWith("Java ")
      ? block.javaVersion
      : `Java ${block.javaVersion}`
    : "Java";

  if (block.codeLabel) {
    return block.codeLabel.includes(runtime)
      ? block.codeLabel
      : `${block.codeLabel} · ${runtime}`;
  }

  return runtime;
}

function getCodeKindLabel(codeKind?: string) {
  return codeKind ? (codeKindLabels[codeKind] ?? codeKind) : undefined;
}

function ConceptMap({
  conceptMap
}: {
  conceptMap?: LessonLearningBlock["conceptMap"];
}) {
  if (!conceptMap?.length) {
    return null;
  }

  return (
    <ol aria-label="本节因果地图" className="concept-map">
      {conceptMap.map((concept, index) => (
        <li className="concept-map-node" key={`${index}-${concept.label}`}>
          {index > 0 && (
            <span aria-hidden="true" className="concept-map-arrow">
              →
            </span>
          )}
          <strong>{concept.label}</strong>
          <small>{concept.relation}</small>
        </li>
      ))}
    </ol>
  );
}

function ExecutionTrace({
  trace
}: {
  trace?: LessonLearningBlock["trace"];
}) {
  if (!trace?.length) {
    return null;
  }

  return (
    <table className="mechanism-trace">
      <caption className="sr-only">执行轨迹</caption>
      <thead>
        <tr>
          <th scope="col">线程或主体</th>
          <th scope="col">执行动作</th>
          <th scope="col">此刻状态</th>
        </tr>
      </thead>
      <tbody>
        {trace.map((step, index) => (
          <tr key={`${index}-${step.thread}-${step.action}`}>
            <td>{step.thread}</td>
            <td>{step.action}</td>
            <td>{step.state && <code>{step.state}</code>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ApiOptions({
  options
}: {
  options?: LessonLearningBlock["apiOptions"];
}) {
  if (!options?.length) {
    return null;
  }

  return (
    <div className="api-decision-grid">
      {options.map((option) => (
        <article key={option.api}>
          <h3>
            <code>{option.api}</code>
          </h3>
          <p>
            <strong>适用场景</strong>
            {option.useWhen}
          </p>
          <p>
            <strong>它保证</strong>
            {option.guarantees}
          </p>
          <p>
            <strong>它不保证</strong>
            {option.doesNotGuarantee}
          </p>
        </article>
      ))}
    </div>
  );
}

function DistributedBoundary({ block }: { block: LessonLearningBlock }) {
  if (
    !block.localGuarantee &&
    !block.breaksWith &&
    !block.alternatives?.length
  ) {
    return null;
  }

  return (
    <aside
      aria-label="跨进程或跨机器边界"
      className="distributed-boundary-card"
    >
      <strong>跨进程或跨机器边界</strong>
      {block.localGuarantee && (
        <p>
          <b>本地保证：</b>
          {block.localGuarantee}
        </p>
      )}
      {block.breaksWith && (
        <p>
          <b>何时失效：</b>
          {block.breaksWith}
        </p>
      )}
      {block.alternatives?.length && (
        <>
          <p>
            <b>可选方案：</b>
          </p>
          <BulletList items={block.alternatives} />
        </>
      )}
    </aside>
  );
}

function Checkpoint({
  checkpoint
}: {
  checkpoint?: LessonLearningBlock["checkpoint"];
}) {
  if (!checkpoint) {
    return null;
  }

  return (
    <div className="checkpoint-card">
      <strong>检查点：先作答，再核对</strong>
      <p>{checkpoint.prompt}</p>
      <p className="learning-block-label">通过标准</p>
      <BulletList items={checkpoint.successCriteria} />

      {checkpoint.hint && (
        <details className="question-card learning-details">
          <summary>
            <span>需要一点提示？</span>
          </summary>
          <div className="question-answer">
            <p className="answer-label">提示</p>
            <p>{checkpoint.hint}</p>
          </div>
        </details>
      )}

      {checkpoint.answer?.length && (
        <details className="question-card learning-details">
          <summary>
            <span>查看检查点答案</span>
          </summary>
          <div className="question-answer">
            <p className="answer-label">检查点答案</p>
            <DetailContent content={checkpoint.answer} />
          </div>
        </details>
      )}
    </div>
  );
}

function LearningBlock({
  block,
  index,
  total
}: {
  block: LessonLearningBlock;
  index: number;
  total: number;
}) {
  const headingId = `${getLearningBlockId(index)}-title`;
  const coreExplanation = (
    <>
      <Paragraphs content={block.body} />
      <BulletList items={block.bullets} />
    </>
  );
  const shouldEmphasizeMisconception = block.kind === "misconception";
  const requiresInquiryFlow =
    Boolean(block.prediction) &&
    (block.kind === "misconception" || block.kind === "experiment");
  const explanatoryContent = (
    <>
      {shouldEmphasizeMisconception ? (
        <div className="misconception-card">
          <strong>这个直觉漏掉了哪一步？</strong>
          {coreExplanation}
        </div>
      ) : (
        coreExplanation
      )}

      <ConceptMap conceptMap={block.conceptMap} />

      {block.invariant && (
        <div className="article-note learning-invariant">
          <strong>要守住的不变量</strong>
          <p>{block.invariant}</p>
        </div>
      )}
    </>
  );
  const hasPractice = Boolean(
    block.task || block.constraints?.length || block.adversarialTest
  );
  const practiceCard = hasPractice && (
    <div className="implementation-card">
      <strong>你的动手任务</strong>
      {block.task && <p>{block.task}</p>}
      {block.constraints?.length && (
        <>
          <p className="learning-block-label">约束条件</p>
          <BulletList items={block.constraints} />
        </>
      )}
      {block.adversarialTest && (
        <div className="learning-adversarial-test">
          <p className="learning-block-label">对抗测试</p>
          <DetailContent
            codeLabel="对抗测试"
            content={block.adversarialTest}
          />
        </div>
      )}
    </div>
  );

  return (
    <section
      aria-labelledby={headingId}
      className={`learning-block learning-block-${block.kind}`}
      id={getLearningBlockId(index)}
    >
      <div className="learning-block-header">
        <div>
          <p className="eyebrow">
            第 {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} 步 ·{" "}
            {getLearningBlockEyebrow(block)}
          </p>
          <h2 id={headingId}>{block.title}</h2>
        </div>
      </div>

      {block.goal && (
        <div className="learning-goal">
          <strong>完成这一步后，你应该能回答</strong>
          <p>{block.goal}</p>
        </div>
      )}

      {block.prerequisites?.length && (
        <div className="learning-prerequisites">
          <p className="learning-block-label">开始前，请确认</p>
          <BulletList items={block.prerequisites} />
        </div>
      )}

      {block.kind === "implementation" && practiceCard}

      {block.prediction && (
        <div className="misconception-card learning-prediction">
          <strong>先做预测</strong>
          <p>{block.prediction}</p>
        </div>
      )}

      {!requiresInquiryFlow && explanatoryContent}

      {block.code && (
        <CodeBlock
          code={block.code}
          codeKind={getCodeKindLabel(block.codeKind)}
          label={getCodeLabel(block)}
        />
      )}

      {block.runCommand && (
        <CodeBlock code={block.runCommand} label="运行命令" />
      )}

      {block.expectedOutput && (
        <div className="experiment-output">
          <strong>预期现象或输出</strong>
          <pre>
            <code>{block.expectedOutput.join("\n")}</code>
          </pre>
        </div>
      )}

      {block.observation && (
        <div className="learning-observation">
          <strong>实际观察到什么</strong>
          <p>{block.observation}</p>
        </div>
      )}

      {requiresInquiryFlow && (
        <div className="learning-explanation">
          <p className="learning-block-label">解释刚才的现象</p>
          {explanatoryContent}
        </div>
      )}

      <ExecutionTrace trace={block.trace} />
      <ApiOptions options={block.apiOptions} />

      {block.kind !== "implementation" && practiceCard}

      <DistributedBoundary block={block} />
      <Checkpoint checkpoint={block.checkpoint} />

      {block.hints?.length && (
        <details className="question-card learning-details">
          <summary>
            <span>需要一点提示？</span>
          </summary>
          <div className="question-answer">
            <p className="answer-label">逐层提示</p>
            <BulletList items={block.hints} />
          </div>
        </details>
      )}

      {block.solution && (
        <details className="question-card learning-details">
          <summary>
            <span>查看完整解答</span>
          </summary>
          <div className="question-answer">
            <p className="answer-label">完整解答</p>
            <DetailContent content={block.solution} />
          </div>
        </details>
      )}
    </section>
  );
}

export function LearningBlocks({
  blocks
}: {
  blocks: readonly LessonLearningBlock[];
}) {
  return (
    <div className="learning-flow">
      {blocks.map((block, index) => (
        <LearningBlock
          block={block}
          index={index}
          key={`${block.kind}-${block.title}`}
          total={blocks.length}
        />
      ))}
    </div>
  );
}
