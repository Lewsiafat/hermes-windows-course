#!/usr/bin/env node
// Zero-dependency consistency check between course.json, index.html, and the root HTML files.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const course = JSON.parse(readFileSync(join(root, 'course.json'), 'utf8'));
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

const pages = course.stages.flatMap((s) => s.pages);
const failures = [];

const rootHtmlFiles = readdirSync(root)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

for (const file of rootHtmlFiles) {
  if (!pages.some((p) => p.file === file)) {
    failures.push(`FAIL: ${file} exists on disk but is missing from course.json`);
  }
}

for (const page of pages) {
  if (!rootHtmlFiles.includes(page.file)) {
    failures.push(`FAIL: course.json lists ${page.file} but it does not exist on disk`);
  }
  if (!indexHtml.includes(`href="${page.file}"`)) {
    failures.push(`FAIL: index.html has no href="${page.file}" link`);
  }
}

const footerMatch = indexHtml.match(/<a href="CHANGELOG\.md">v([\d.]+)<\/a>/);
const footerVersion = footerMatch ? footerMatch[1] : null;
if (footerVersion !== course.site.version) {
  failures.push(`FAIL: index.html footer version (${footerVersion}) != course.json site.version (${course.site.version})`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `OK: ${pages.length} pages in course.json, ${rootHtmlFiles.length} root HTML files matched, version v${course.site.version} consistent.`
);
