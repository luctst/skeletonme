import { build } from 'esbuild'
import http from 'node:http'
import { writeFile, copyFile, mkdir } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import path from 'node:path'

// playwright is installed GLOBALLY (not a project dep). Resolve it from the global
// modules dir, falling back to a local install if one happens to be present.
const { chromium } = await (async () => {
  try {
    return await import('playwright')
  } catch {
    const require = createRequire(import.meta.url)
    const globalRoot = execSync('npm root -g').toString().trim()
    return require(path.join(globalRoot, 'playwright'))
  }
})()

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.qa-build')
const SHOTS = path.join(ROOT, '.qa-reports', 'screenshots')
const issues = []
const passed = []
const consoleErrors = []

function issue(sev, title, expected, actual) {
  issues.push({ sev, title, expected, actual })
}
function near(a, b, tol = 2) {
  return Math.abs(a - b) <= tol
}

// 1. Build the harness (real src/SkeletonMe, bundled for the browser).
await mkdir(OUT, { recursive: true })
await mkdir(SHOTS, { recursive: true })
await build({
  entryPoints: [path.join(ROOT, 'qa', 'harness.tsx')],
  bundle: true,
  outfile: path.join(OUT, 'harness.js'),
  jsx: 'automatic',
  loader: { '.css': 'css' },
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'error',
})
await copyFile(path.join(ROOT, 'qa', 'index.html'), path.join(OUT, 'index.html'))

// 2. Serve the build.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const server = http.createServer((req, res) => {
  const file = path.join(OUT, req.url === '/' ? 'index.html' : req.url)
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
  createReadStream(file).on('error', () => { res.statusCode = 404; res.end() }).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const url = `http://localhost:${server.address().port}/`

// 3. Drive the browser.
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 800, height: 1000 } })
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))

await page.goto(url, { waitUntil: 'networkidle' })

// Loaded state: capture real leaf geometry.
const leafSel = ['avatar', 'name', 'role', 'bio']
const leafBoxes = {}
for (const l of leafSel) {
  leafBoxes[l] = await page.locator(`#auto-host [data-leaf="${l}"]`).boundingBox()
}
await page.screenshot({ path: path.join(SHOTS, 'loaded.png'), fullPage: true })

const loadedOverlays = await page.locator('[data-skeletonme]').count()
if (loadedOverlays === 0) passed.push('No skeleton overlays render while showSkeleton=false')
else issue('HIGH', 'Skeleton overlays present when not loading', '0 overlays', `${loadedOverlays} overlays`)

// Flip to loading.
await page.locator('#toggle').click()
await page.waitForSelector('#auto-host [data-skeletonme]', { timeout: 3000 }).catch(() => {})

// Stability: sample each host's skeleton-rect count over ~1.5s. A host that keeps
// changing is oscillating (e.g. a re-measure loop), not settling. Catch it instead
// of trusting one lucky frame.
const counts = { 'auto-host': [], 'fallback-host': [], 'escape-host': [] }
for (let i = 0; i < 10; i++) {
  const snap = await page.evaluate(() => ({
    'auto-host': document.querySelectorAll('#auto-host [data-skeletonme]').length,
    'fallback-host': document.querySelectorAll('#fallback-host [data-skeletonme]').length,
    'escape-host': document.querySelectorAll('#escape-host [data-skeletonme]').length,
  }))
  for (const k of Object.keys(counts)) counts[k].push(snap[k])
  await page.waitForTimeout(150)
}
for (const [host, series] of Object.entries(counts)) {
  if (new Set(series).size > 1)
    issue('HIGH', `${host} skeleton oscillates (does not settle)`, 'stable count', `samples: ${series.join(',')}`)
  else passed.push(`${host}: stable at ${series[0]} rect(s) over 1.5s`)
}
await page.screenshot({ path: path.join(SHOTS, 'skeleton.png'), fullPage: true })

// --- Case auto: one overlay per leaf, geometry matches the real leaves ---
const autoOverlays = page.locator('#auto-host [data-skeletonme]')
const autoCount = await autoOverlays.count()
if (autoCount === leafSel.length) passed.push(`Auto case: ${autoCount} overlay rects = ${leafSel.length} real leaves`)
else issue('CRITICAL', 'Auto-measure produced wrong number of skeleton blocks',
  `${leafSel.length} overlays (one per leaf)`, `${autoCount} overlays`)

const overlayBoxes = []
for (let i = 0; i < autoCount; i++) overlayBoxes.push(await autoOverlays.nth(i).boundingBox())

let geomOk = autoCount > 0
for (const l of leafSel) {
  const lb = leafBoxes[l]
  if (!lb) continue
  const match = overlayBoxes.find(
    (o) => o && near(o.x, lb.x) && near(o.y, lb.y) && near(o.width, lb.width) && near(o.height, lb.height),
  )
  if (!match) {
    geomOk = false
    issue('CRITICAL', `Skeleton block for "${l}" does not align with the real element`,
      `rect at (${lb.x.toFixed(0)},${lb.y.toFixed(0)}) ${lb.width.toFixed(0)}x${lb.height.toFixed(0)}`,
      `no overlay within 2px of that box`)
  }
}
if (geomOk) passed.push('Auto case: every overlay rect aligns with its real leaf (pos + size within 2px)')

// Real text must be hidden (not visible) under the skeleton.
const nameVisible = await page.locator('#auto-host [data-leaf="name"]').isVisible()
if (!nameVisible) passed.push('Auto case: real content is visually hidden under the skeleton')
else issue('HIGH', 'Real content still visible under the skeleton', 'children visibility:hidden', 'children visible')

// Overlays carry the shimmer class.
const shimmer = await autoOverlays.nth(0).evaluate((el) => el.classList.contains('skeletonme')).catch(() => false)
if (shimmer) passed.push('Auto case: overlays use the .skeletonme shimmer class')
else if (autoCount > 0) issue('MEDIUM', 'Skeleton overlay missing .skeletonme class', 'class "skeletonme"', 'class absent')

// --- Case fallback: zero-layout children → single width/height box ---
const fb = page.locator('#fallback-host [data-skeletonme]')
const fbCount = await fb.count()
if (fbCount === 1) {
  const box = await fb.first().boundingBox()
  if (box && near(box.width, 220) && near(box.height, 44)) passed.push('Fallback case: single 220x44 box when no layout to measure')
  else issue('HIGH', 'Fallback box has wrong size', '220x44', box ? `${box.width.toFixed(0)}x${box.height.toFixed(0)}` : 'no box')
} else {
  issue('HIGH', 'Data-less fallback did not render exactly one box', '1 box', `${fbCount} boxes`)
}

// --- Case escape: custom skeleton wins, no auto overlays ---
const customShown = await page.locator('#escape-host #custom-skel').isVisible()
const escapeOverlays = await page.locator('#escape-host [data-skeletonme]').count()
if (customShown && escapeOverlays === 0) passed.push('Escape hatch: custom skeleton rendered, no auto overlays')
else issue('HIGH', 'Escape hatch did not take precedence',
  'custom skeleton visible, 0 auto overlays', `custom=${customShown}, overlays=${escapeOverlays}`)

// Console hygiene.
if (consoleErrors.length === 0) passed.push('No console errors or page errors during the run')
else issue('MEDIUM', 'Console/page errors during run', '0 errors', consoleErrors.join(' | '))

await browser.close()
server.close()

// 4. Score + report.
const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
issues.sort((a, b) => order[a.sev] - order[b.sev])
const has = (s) => issues.some((i) => i.sev === s)
let score = 10
if (has('CRITICAL')) score = 2
else if (has('HIGH')) score = 5
else if (has('MEDIUM')) score = 7
else if (has('LOW')) score = 9

const result = { score, issues, passed, consoleErrors, leafBoxes, overlayBoxes }
await writeFile(path.join(ROOT, '.qa-reports', 'result.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
