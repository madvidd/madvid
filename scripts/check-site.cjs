/* Static checks for the public HTML site. Run with: node scripts/check-site.cjs */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const publicBase = 'https://madvidd.github.io/madvid/';
const errors = [];
const htmlFiles = ['', 'media', 'projects'].flatMap(directory =>
  fs.readdirSync(path.join(root, directory))
    .filter(name => name.endsWith('.html'))
    .map(name => path.posix.join(directory, name))
);
const pages = new Map(htmlFiles.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const active = [...pages].filter(([, html]) => !/<meta\b[^>]*http-equiv="refresh"/i.test(html));
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const canonicalFor = file => publicBase + (file === 'index.html' ? '' : file);
const localURL = (value, file) => {
  try {
    const url = new URL(decode(value), canonicalFor(file));
    if (!url.href.startsWith(publicBase)) return null;
    const relative = decodeURIComponent(url.pathname.slice(new URL(publicBase).pathname.length)) || 'index.html';
    return { file: relative, hash: decodeURIComponent(url.hash.slice(1)) };
  } catch {
    errors.push(`${file}: malformed URL ${value}`);
    return null;
  }
};

for (const [file, html] of pages) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  for (const duplicate of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) errors.push(`${file}: duplicate id ${duplicate}`);
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${file}: invalid JSON-LD: ${error.message}`); }
  }
  for (const match of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
    const target = localURL(match[1], file);
    if (!target) continue;
    const diskPath = path.resolve(root, target.file);
    if (!diskPath.startsWith(root + path.sep) || !fs.existsSync(diskPath)) {
      errors.push(`${file}: missing local target ${match[1]}`);
      continue;
    }
    if (target.hash && target.file.endsWith('.html')) {
      const targetHTML = pages.get(target.file) || fs.readFileSync(diskPath, 'utf8');
      const targetIDs = [...targetHTML.matchAll(/\sid="([^"]+)"/g)].map(item => item[1]);
      if (!targetIDs.includes(target.hash)) errors.push(`${file}: missing fragment ${match[1]}`);
    }
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(image[0])) errors.push(`${file}: image without descriptive alt text`);
  }
}

for (const [file, html] of active) {
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${file}: expected exactly one h1`);
  if ((html.match(/<main(?:\s|>)/g) || []).length !== 1) errors.push(`${file}: expected exactly one main`);
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  if (canonical !== canonicalFor(file)) errors.push(`${file}: unexpected canonical ${canonical}`);
  if (!html.includes('nav-more-menu')) errors.push(`${file}: shared navigation missing`);
  if (!/script\.js\?v=20260917-sections/.test(html)) errors.push(`${file}: shared script version missing`);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decode(match[1]));
const sitemapImages = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => decode(match[1]));
for (const [file] of active) if (!sitemapPages.includes(canonicalFor(file))) errors.push(`${file}: absent from sitemap`);
if (new Set(sitemapPages).size !== sitemapPages.length) errors.push('Duplicate sitemap page URLs');
if (sitemapPages.length !== active.length) errors.push('Sitemap page count differs from active page count');
for (const url of sitemapImages) {
  const target = localURL(url, 'index.html');
  if (!target || !fs.existsSync(path.join(root, target.file))) errors.push(`Missing sitemap image: ${url}`);
}
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
if (/localStorage|ambient-controls|background-motion-status/.test(script)) errors.push('Removed background preferences remain in shared script');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${active.length} active pages, ${htmlFiles.length - active.length} legacy redirect, ${new Set(sitemapImages).size} indexed images; local files/fragments, image alt text, shared navigation, canonical URLs and JSON-LD verified.`);
}
