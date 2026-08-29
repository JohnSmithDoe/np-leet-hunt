#!/usr/bin/env node
// Generates event hero images by driving deepai.org/machine-learning-model/text2img
// the way a person would: paste prompt -> Generate -> Download -> save under the
// event key. Prompts come from event-image-prompts.md, which stays the only source.
//
//   node generate.mjs --list
//   node generate.mjs --sector frozen --limit 1
//   node generate.mjs --keys frozen-music-box,frozen-glacier-tomb
//   node generate.mjs                       # every event still missing an image
//
// Exits 2 when the anonymous quota is spent, so a caller can tell "blocked" from "broken".

import { existsSync } from 'node:fs';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const PROMPTS = join(ROOT, 'event-image-prompts.md');
const OUT_DIR = join(ROOT, 'libs/np-space-map/src/assets/events');
const PROFILE = join(HERE, '.chrome-profile');
const URL = 'https://deepai.org/machine-learning-model/text2img';
const QUOTA_EXIT = 2;
const SHAPE = 1; // 832x448 — the widest of the five, closest to 16:9

const { chromium } = await import(join(ROOT, 'node_modules/playwright-core/index.mjs'));

const flag = (name) => process.argv.includes(name);
const opt = (name, fallback) => {
    const i = process.argv.indexOf(name);
    return i === -1 ? fallback : process.argv[i + 1];
};

const tidy = (s) =>
    s
        .replace(/\s*\n\s*/g, ' ')
        .replace(/[_*`]/g, '')
        .trim();

// --- parse event-image-prompts.md -------------------------------------------

const md = await readFile(PROMPTS, 'utf8');

const globalPrefix = tidy(md.match(/### Global Style Prefix[^\n]*\n+```\n([\s\S]*?)```/)?.[1] ?? '');
if (!globalPrefix) throw new Error('Could not find the Global Style Prefix block in event-image-prompts.md');

const styleBlock = md.match(/### Sector Style lines[\s\S]*?\n(- \*\*[\s\S]*?)\n>/)?.[1] ?? '';
const styles = [...styleBlock.matchAll(/- \*\*(.+?)\*\*[^—]*—\s*([\s\S]*?)(?=\n- \*\*|$)/g)].map(([, label, text]) => ({
    label: tidy(label),
    text: tidy(text),
}));

// A section heading like "Frozen Drift — sector 2 (…)" picks the style whose label it starts with.
const styleFor = (heading) => {
    const hit = styles.find((s) => heading.toLowerCase().startsWith(s.label.toLowerCase().split(' / ')[0]));
    return (hit ?? styles.find((s) => /^core/i.test(s.label)))?.text ?? '';
};

const jobs = [];
let heading = '';
for (const line of md.split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) {
        heading = h[1].trim();
        continue;
    }
    const b = line.match(/^- \*\*`([^`]+)`\*\*\s*—\s*(.+)$/);
    if (b && heading) {
        jobs.push({ key: b[1], scene: tidy(b[2]), section: heading, style: styleFor(heading) });
    }
}

if (!jobs.length) throw new Error('Parsed zero prompts — has event-image-prompts.md changed format?');

const promptFor = (j) => `${globalPrefix} ${j.style} ${j.scene}`;

// --- select ------------------------------------------------------------------

const keys = opt('--keys', '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
const sector = opt('--sector', '');
const limit = Number(opt('--limit', Infinity));

let selected = jobs;
if (keys.length) selected = selected.filter((j) => keys.includes(j.key));
else if (sector) selected = selected.filter((j) => j.key.startsWith(sector) || j.section.toLowerCase().includes(sector.toLowerCase()));

const missing = selected.filter((j) => !existsSync(join(OUT_DIR, `${j.key}.jpeg`)));

if (flag('--list')) {
    const width = Math.max(...jobs.map((j) => j.key.length));
    let section = '';
    for (const j of selected) {
        if (j.section !== section) console.log(`\n${(section = j.section)}`);
        const have = existsSync(join(OUT_DIR, `${j.key}.jpeg`));
        console.log(`  ${have ? '✓' : '·'} ${j.key.padEnd(width)}  ${have ? '' : `${promptFor(j).length} chars`}`);
    }
    console.log(`\n${selected.length - missing.length}/${selected.length} generated, ${missing.length} missing.`);
    process.exit(0);
}

const queue = missing.slice(0, Number.isFinite(limit) ? limit : undefined);
if (!queue.length) {
    console.log('Nothing to generate — every selected event already has an image.');
    process.exit(0);
}

if (flag('--dry-run')) {
    queue.forEach((j, i) => console.log(`${String(i + 1).padStart(2)}. ${j.key}\n    ${promptFor(j)}\n`));
    process.exit(0);
}

// --- drive the page ----------------------------------------------------------

await mkdir(OUT_DIR, { recursive: true });

const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome',
    headless: flag('--headless'),
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

// Aspect ratio is a page control, not a prompt instruction. showShapeOptions() toggles the
// row, so only open it when collapsed; selectShape() marks the choice with iscurrentshape.
const chooseShape = async (n) => {
    const collapsed = await page.evaluate(() => {
        const row = document.querySelector('#suboutline-try-it');
        return !row || getComputedStyle(row).display === 'none';
    });
    if (collapsed) await page.click('#modelEditButton');
    await page.click(`#edit_shape_${n}`, { timeout: 15000 });
    if ((await page.getAttribute(`#edit_shape_${n}`, 'iscurrentshape')) !== 'True') {
        throw new Error(`shape ${n} did not take`);
    }
};

const done = [];
const failed = [];
let quotaHit = false;

console.log(`Generating ${queue.length} image(s) at shape ${SHAPE}.`);

for (const [i, job] of queue.entries()) {
    const label = `[${i + 1}/${queue.length}] ${job.key}`;
    try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(2000);
        for (const sel of ['#close-promo-modal', '#dismiss-banner']) {
            const el = page.locator(sel);
            if (await el.isVisible().catch(() => false)) await el.click().catch(() => {});
        }

        await chooseShape(SHAPE);
        await page.fill('#generate-textarea', promptFor(job));
        await page.click('#modelSubmitButton');

        // The Download button is hidden until a real result exists, so its
        // appearance is the completion signal. Race it against the error line.
        const dl = page.locator('#download-button');
        const err = page.locator('#tryItResultError');

        const outcome = await Promise.race([
            dl.waitFor({ state: 'visible', timeout: 240000 }).then(() => ({ kind: 'ready' })),
            err
                .waitFor({ state: 'visible', timeout: 240000 })
                .then(async () => ({ kind: 'error', message: (await err.innerText()).trim() }))
                .catch(() => new Promise(() => {})),
        ]).catch((e) => ({ kind: 'timeout', message: e.message }));

        if (outcome.kind === 'error') throw new Error(`site said: "${outcome.message}"`);
        if (outcome.kind !== 'ready') throw new Error(`no result after 4min (${outcome.message ?? '?'})`);

        const [download] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), dl.click()]);

        const dest = join(OUT_DIR, `${job.key}.jpeg`);
        await download.saveAs(dest);

        const { size } = await stat(dest);
        if (size < 5000) throw new Error(`suspiciously small (${size}B) — likely a placeholder`);

        console.log(`${label} -> ${job.key}.jpeg (${(size / 1024).toFixed(0)} KB)`);
        done.push(job.key);
    } catch (e) {
        console.error(`${label} FAILED: ${e.message}`);
        failed.push(job.key);
        if (/exceeded|limit|quota|too many/i.test(e.message)) {
            quotaHit = true;
            console.error('\nAnonymous quota is spent. Nothing further will succeed until it resets.');
            break;
        }
    }

    await page.waitForTimeout(4000);
}

await ctx.close();

console.log(`\n${done.length} written${failed.length ? `, ${failed.length} failed: ${failed.join(', ')}` : ''}.`);
const remaining = missing.length - done.length;
if (remaining > 0) console.log(`${remaining} still missing — re-run to continue where this left off.`);

process.exit(quotaHit ? QUOTA_EXIT : failed.length ? 1 : 0);
