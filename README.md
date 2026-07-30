# Cloverdew Engineering Lab

An experiment-first learning site for engineers who want to reason about Java
concurrency from first principles and carry that reasoning into query engines,
streaming systems, and trustworthy data infrastructure for AI.

[Open the hosted site](https://cloverdew-engineering-lab.cloverdue.chatgpt.site)
(workspace access may be required).

## What this project contains

The site follows a 24-week, two-hours-per-week systems engineering track. Each
published lesson starts with a failure, builds a mental model, and ends with
evidence that the implementation is correct.

The first four lessons cover:

1. Threads, shared state, and lost updates
2. Happens-before and safe publication
3. Atomic task-state transitions
4. Bounded queues and overload policy

Answers stay collapsed until requested and include broken and corrected Java
examples, API trade-offs, adversarial tests, and distributed-system
consequences. The cumulative project, **QueryGate**, applies those ideas to a
small multi-tenant execution service with explicit capacity, lifecycle, and
shutdown invariants.

## Tech stack

- Next.js 16 and React 19
- TypeScript
- OpenNext for Cloudflare
- Wrangler/workerd-compatible deployment output
- Plain CSS with light and dark themes

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development command intentionally uses Webpack because it is the stable
fallback for a Turbopack resolver issue seen with this project. Production
builds still use the normal Next.js build path.

## Validate a change

```bash
npm run typecheck
npm run build
```

Run both commands before opening a pull request.

## Build and package the hosted worker

Create a deployable Sites archive with:

```bash
npm run package:site
```

The command:

1. builds the application with OpenNext;
2. removes a guarded development-only Next.js file-logger initializer;
3. runs Wrangler's compatibility bundling pass;
4. writes `site-build.tar.gz`.

Do not archive the intermediate OpenNext worker directly. The second Wrangler
pass converts remaining Node/CommonJS built-in imports into output that can run
under workerd. The archive also includes `wrangler.jsonc` and
`.openai/hosting.json`, which are required by the hosted deployment.

To inspect the generated package:

```bash
tar -tzf site-build.tar.gz
```

The archive is a build artifact and is intentionally ignored by Git.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run build` | Create the standard Next.js production build |
| `npm run build:worker` | Build the final workerd-compatible worker |
| `npm run package:site` | Build and archive the deployable site |
| `npm run preview` | Preview the OpenNext worker locally |

## Project structure

```text
app/                         Routes, layouts, and global styles
components/                  Interactive and reusable UI components
lib/content.ts               Lesson, roadmap, and question content
public/                      Static deployment files
scripts/build-worker.mjs     OpenNext and Wrangler worker build
scripts/package-site.mjs     Reproducible Sites archive creation
open-next.config.ts          OpenNext configuration
wrangler.jsonc               workerd runtime and asset configuration
```

## Add or update a lesson

Lesson content lives in `lib/content.ts`. A lesson has a stable slug, week
number, publication status, sections, and expandable questions. Detailed
answers can include:

- explanatory paragraphs and proof obligations;
- Java code examples;
- alternative APIs and their trade-offs;
- distributed-system implications.

Keep upcoming lessons visible in the roadmap, but mark them as `upcoming` until
their experiments and explanations are complete.

## Pull requests

Keep changes narrow and include the evidence used to validate them. For lesson
content, state the invariant being taught and include an adversarial scenario.
For runtime or packaging changes, run the typecheck, production build, and site
packaging command.

This repository does not currently declare an open-source license. Please do
not assume reuse rights beyond reviewing and contributing through the
repository.
