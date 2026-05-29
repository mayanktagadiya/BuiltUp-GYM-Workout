// Generates PWA icons using Playwright (already a dev dependency).
// Run: node scripts/gen-icons.mjs
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function html(size) {
  const fontSize = Math.round(size * 0.52)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${size}px;
    height: ${size}px;
    background: #0A0A0A;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .letter {
    color: #D4A574;
    font-size: ${fontSize}px;
    font-weight: 700;
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1;
    letter-spacing: -0.02em;
    user-select: none;
  }
</style>
</head>
<body><span class="letter">B</span></body>
</html>`
}

const browser = await chromium.launch()

const jobs = [
  { size: 512, out: 'public/icons/icon-512x512.png' },
  { size: 192, out: 'public/icons/icon-192x192.png' },
  { size: 180, out: 'public/apple-touch-icon.png' },
]

for (const { size, out } of jobs) {
  const page = await browser.newPage()
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(html(size), { waitUntil: 'load' })
  const outPath = path.join(__dirname, '..', out)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: size, height: size } })
  await page.close()
  console.log(`✓ ${out} (${size}×${size})`)
}

await browser.close()
console.log('Done.')
