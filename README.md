# Cloverdew 工程实验室

这是一个以实验为先的学习站点，面向希望从第一性原理理解 Java
并发与 Apache Flink 运行时，并将这种推理能力迁移到查询引擎、流式系统和面向 AI
的可信数据基础设施的工程师。

[打开已部署的网站](https://cloverdew-engineering-lab.cloverdue.chatgpt.site)
（可能需要工作区访问权限）。

## 项目内容

本站包含两条彼此独立的学习轨道：

- **Java 并发与系统工程主线：**为期 24 周、每周投入两小时，以
  `QueryGate` 为累积项目；
- **Flink 精通轨道：**面向写过 Flink 作业的工程师，通过 12 个深度模块学习
  运行时拓扑、时间、状态、检查点、故障恢复与端到端一致性。

每节已发布课程都从一个问题或故障开始，建立心智模型，并以实现正确性的证据结束。
Java 主线保留原有 24 周节奏；Flink 内容不会挤占或改写这条路线。

答案默认折叠，按需展开；其中包含有缺陷和修正后的 Java 示例、应用程序编程接口（API）的取舍、对抗性测试以及分布式系统后果。累积项目 **QueryGate** 将这些思想用于一个小型多租户执行服务，并显式定义容量、生命周期和关闭不变量。

## 技术栈

- Next.js 16 与 React 19
- TypeScript
- 面向 Cloudflare 的 OpenNext
- 与 Wrangler/workerd 兼容的部署产物
- 支持浅色和深色主题的原生 CSS

## 本地运行

前置要求：

- Node.js 20 或更高版本
- npm 10 或更高版本

安装依赖并启动开发服务器：

```bash
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

开发命令有意使用 Webpack：它是本项目遇到 Turbopack 解析器问题时稳定的后备方案。生产构建仍走正常的 Next.js 构建路径。

## 验证改动

```bash
npm run typecheck
npm run build
npm run validate:course-content
npm run validate:lesson-java
```

发起拉取请求前请运行这些检查。`validate:lesson-java` 需要 JDK 21；
课程结构校验不依赖 Flink 集群。

## 构建并打包托管 Worker

使用以下命令创建可部署的 Sites 归档包：

```bash
npm run package:site
```

该命令会：

1. 使用 OpenNext 构建应用；
2. 移除受保护的、仅在开发期使用的 Next.js 文件日志器初始化逻辑；
3. 执行 Wrangler 的兼容性打包步骤；
4. 写入 `site-build.tar.gz`。

不要直接归档中间态 OpenNext Worker。第二次 Wrangler 打包会把残留的 Node/CommonJS 内置模块导入转换为可在 workerd 中运行的产物。归档包还包含托管部署所需的 `wrangler.jsonc` 和 `.openai/hosting.json`。

检查生成的归档包：

```bash
tar -tzf site-build.tar.gz
```

该归档包是构建产物，已被有意加入 Git 忽略列表。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run typecheck` | 在不输出文件的情况下检查 TypeScript |
| `npm run build` | 创建标准 Next.js 生产构建 |
| `npm run validate:course-content` | 检查课程 slug、轨道课次、模块映射与发布内容完整性 |
| `npm run validate:lesson-java` | 使用 JDK 21 编译并运行可独立验证的课程 Java 示例 |
| `npm run build:worker` | 构建最终与 workerd 兼容的 Worker |
| `npm run package:site` | 构建并归档可部署站点 |
| `npm run preview` | 在本地预览 OpenNext Worker |

## 项目结构

```text
app/                         路由、布局与全局样式
components/                  交互式和可复用的界面组件
lib/content.ts               课程、路线图与问题内容
lib/flink-content.ts         Flink 精通轨道的模块与课程正文
lib/curriculum.ts            两条轨道的课程聚合与查询入口
public/                      静态部署文件
scripts/build-worker.mjs     OpenNext 和 Wrangler Worker 构建脚本
scripts/package-site.mjs     可复现的 Sites 归档创建脚本
open-next.config.ts          OpenNext 配置
wrangler.jsonc               workerd 运行时与静态资源配置
```

## 新增或更新课程

Java 课程位于 `lib/content.ts`，Flink 课程位于 `lib/flink-content.ts`，由
`lib/curriculum.ts` 统一聚合。一节课程包含稳定的 slug、轨道、课次、发布状态和渐进式学习块。详细答案可以包含：

- 解释性段落与证明义务；
- Java 代码示例；
- 备选 API 及其取舍；
- 分布式系统影响。

让后续课程继续显示在路线图中，但在实验和说明完成前，将其标记为 `upcoming`。

## 拉取请求

保持改动范围聚焦，并附上用于验证的证据。对于课程内容，请说明所教授的不变量并加入一个对抗性场景。对于运行时或打包改动，请运行类型检查、生产构建和站点打包命令。

本仓库目前未声明开源许可证。除通过本仓库审阅和贡献外，请不要假定拥有其他复用权利。
