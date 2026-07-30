import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "QueryGate 项目",
  description:
    "贯穿整个学习路径构建的累积式多租户执行系统。"
};

const invariants = [
  "每个已接纳的任务要么处于终态，要么仍可被发现。",
  "一个任务至多到达一个终态。",
  "队列大小绝不超过配置容量。",
  "运行中的任务绝不超过租户限额。",
  "被拒绝的任务绝不执行。",
  "过载、失败、超时和取消始终可以区分。",
  "关闭会在声明的上限内终止可协作停止的工作。",
  "只有明确安全的操作才允许重试。"
];

export default function ProjectPage() {
  return (
    <>
      <section className="page-hero project-hero">
        <div className="shell narrow">
          <p className="eyebrow">累积项目</p>
          <h1>QueryGate</h1>
          <p>
            一个用于模拟查询、CDC 与上下文构建任务的小型多租户执行服务。它不是
            数据库，也不是 Flink 的克隆；它是一个你能完整负责的子系统。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell project-grid">
          <div>
            <p className="eyebrow">执行路径</p>
            <h2>让责任边界看得见。</h2>
            <p className="section-copy">
              架构刻意保持清晰易读。每一条箭头都会引出一个关于所有权、容量、
              失败或可见性的问题。
            </p>
          </div>
          <div className="architecture" aria-label="QueryGate 架构">
            <div className="arch-node accent">
              <small>01 · 提交</small>
              <strong>准入控制器（AdmissionController）</strong>
              <span>全局上限 + 租户策略</span>
            </div>
            <div className="arch-connector">
              <span>已接纳</span>
              <i />
            </div>
            <div className="arch-split">
              <div className="arch-node">
                <small>02 · 等待</small>
                <strong>有界队列</strong>
                <span>背压 + 拒绝</span>
              </div>
              <div className="arch-node">
                <small>03 · 隔离</small>
                <strong>租户限流器（TenantLimiter）</strong>
                <span>许可 + 公平性</span>
              </div>
            </div>
            <div className="arch-connector">
              <span>已调度</span>
              <i />
            </div>
            <div className="arch-node">
              <small>04 · 执行</small>
              <strong>工作执行器（WorkerExecutor）</strong>
              <span>截止时间 + 取消 + 失败</span>
            </div>
            <div className="arch-connector">
              <span>已观测</span>
              <i />
            </div>
            <div className="arch-split">
              <div className="arch-node">
                <small>05 · 真相</small>
                <strong>任务登记簿（TaskRegistry）</strong>
                <span>唯一终态结果</span>
              </div>
              <div className="arch-node">
                <small>06 · 证据</small>
                <strong>指标与追踪</strong>
                <span>队列、执行、结果</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section invariant-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">不可妥协</p>
              <h2>先定义八项不变量，再开发八项功能。</h2>
            </div>
            <p>
              每个实现选择都必须让这些不变量更容易证明、观测或维持。
            </p>
          </div>
          <div className="invariant-grid">
            {invariants.map((invariant, index) => (
              <div className="invariant-card" key={invariant}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{invariant}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section state-section">
        <div className="shell">
          <div className="state-copy">
            <p className="eyebrow">核心协议</p>
            <h2>状态机就是产品契约。</h2>
            <p>
              每个迁移都有唯一所有者。终态没有出边。关联的结果数据必须与终态
              决策一致地发布。
            </p>
          </div>
          <div className="state-machine">
            <div className="state-line">
              <span>已提交</span>
              <i>→</i>
              <span>已入队</span>
              <i>→</i>
              <span className="active">运行中</span>
            </div>
            <div className="state-branches">
              <span>成功</span>
              <span>失败</span>
              <span>已取消</span>
              <span>已超时</span>
            </div>
            <p>已提交或已入队也可以迁移为已拒绝或已取消。</p>
          </div>
        </div>
      </section>

      <section className="section project-cta">
        <div className="shell">
          <h2>从计数器开始，而不是从执行器开始。</h2>
          <p>
            后续每个组件都依赖于你在第 1 周形成的推理习惯。
          </p>
          <Link className="button button-primary" href="/lessons/threads-and-shared-state">
            打开第一课 <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
