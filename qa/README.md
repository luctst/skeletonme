# QA harness

Real-browser check for `<SkeletonMe>` (the jsdom unit suite can't measure layout).
Not part of the published package — `qa/` and `.qa-reports/` are gitignored.

**Playwright is a global tool, not a project dep.** One-time setup:

```bash
npm install -g playwright@1.61.1
playwright install chromium
```

Run it:

```bash
node qa/run.mjs
```

Builds `harness.tsx` (the real `src/SkeletonMe`) with esbuild, serves it, drives
Chromium, and writes a report + screenshots to `.qa-reports/`. `esbuild` stays a
local devDep because it bundles the harness.
