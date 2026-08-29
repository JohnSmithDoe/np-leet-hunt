#!/usr/bin/env node
/**
 * export.mjs — drive the hosted Universal LPC Spritesheet Character Generator
 * headlessly and save the rendered character as a PNG spritesheet + credits.txt.
 *
 * It does exactly what a human does: open the generator at a config URL (the
 * `#sex=…&head=…` hash), wait for the character to finish rendering, then click
 * the page's own "Spritesheet (PNG)" and "Credits (TXT)" buttons and capture the
 * downloads. Uses the generator's own compositing — correct z-order + palettes.
 *
 * Requires network access to the hosted site and a Chromium that Playwright can
 * launch (this repo already ships @playwright/test + a cached chromium).
 *
 * Usage:
 *   node export.mjs --out DIR [options] (--hash "k=v&…" | --url URL | --params <json|@file>)
 *
 *   --hash    "sex=male&head=Zombie_bright_green&body=Body_Color_light"   (preferred)
 *   --url     full generator URL incl. the #fragment
 *   --params  JSON object {"sex":"male","head":"Zombie_bright_green",…} or @path/to.json
 *   --out     output directory (default: cwd)
 *   --name    output basename (default: character) → <name>.png + <name>.credits.txt
 *   --base    generator base URL (default: the hosted github.io site)
 *   --timeout per-step timeout ms (default 60000)
 *   --headed  show the browser (debugging)
 *
 * Prints a one-line JSON summary on stdout for the caller to parse.
 *
 * Hash grammar (see ../reference.md): <type_name>=<Name with spaces→_>[_<colorOrVariant>].
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_BASE = 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/';

function parseArgs(argv) {
    const out = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            if (key === 'headed') out.headed = true;
            else out[key] = argv[++i];
        } else out._.push(a);
    }
    return out;
}

/** Mirror the generator's createHashStringFromParams: encodeURIComponent on key & value. */
function paramsToHash(params) {
    return Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
}

function resolveHash(args) {
    if (args.url) {
        const i = args.url.indexOf('#');
        return i === -1 ? '' : args.url.slice(i + 1);
    }
    if (args.hash) return args.hash.replace(/^#/, '');
    if (args.params) {
        const raw = args.params.startsWith('@') ? readFileSync(args.params.slice(1), 'utf8') : args.params;
        return paramsToHash(JSON.parse(raw));
    }
    throw new Error('Provide one of --hash, --url or --params');
}

/**
 * Cheap render-settle probe: read the full-spritesheet preview canvas and return
 * a strided checksum + whether any pixel is non-transparent. Caller waits for the
 * signature to stop changing (render done) and to be non-empty (something drew).
 */
function probeCanvasInBrowser() {
    const sel = ['#mithril-spritesheet-preview canvas', '#mithril-preview canvas', 'canvas'];
    let canvas = null;
    for (const s of sel) {
        canvas = document.querySelector(s);
        if (canvas && canvas.width > 0 && canvas.height > 0) break;
    }
    if (!canvas || !canvas.width || !canvas.height) return { ready: false };
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ready: false };
    const { width: w, height: h } = canvas;
    let data;
    try {
        data = ctx.getImageData(0, 0, w, h).data;
    } catch {
        return { ready: false };
    }
    let sum = 0;
    let nonEmpty = false;
    // Stride across the buffer; cheap but stable signature.
    const step = Math.max(4, Math.floor(data.length / 4096) * 4);
    for (let i = 0; i < data.length; i += step) {
        sum = (sum + data[i] * 31 + data[i + 1] * 17 + data[i + 2] * 13 + data[i + 3] * 7) >>> 0;
        if (data[i + 3] !== 0) nonEmpty = true;
    }
    return { ready: true, sig: `${w}x${h}:${sum}`, nonEmpty };
}

async function waitForRenderSettle(page, timeout) {
    const deadline = Date.now() + timeout;
    let last = null;
    let stable = 0;
    while (Date.now() < deadline) {
        const probe = await page.evaluate(probeCanvasInBrowser);
        if (probe.ready && probe.nonEmpty) {
            if (probe.sig === last) {
                if (++stable >= 2) return true; // unchanged across 3 reads → settled
            } else {
                stable = 0;
                last = probe.sig;
            }
        }
        await page.waitForTimeout(350);
    }
    return false; // proceed anyway; caller warns
}

async function clickAndSave(page, buttonName, dest, timeout) {
    const button = page.locator('#download-buttons').getByRole('button', { name: buttonName, exact: true });
    const [download] = await Promise.all([page.waitForEvent('download', { timeout }), button.click()]);
    await download.saveAs(dest);
    return dest;
}

function countCreditEntries(txt) {
    // creditsToTxt emits one unindented filename line per credited asset.
    return txt.split('\n').filter((l) => l.length > 0 && !/^\s/.test(l)).length;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const hash = resolveHash(args);
    const base = (args.base ?? DEFAULT_BASE).replace(/#.*$/, '');
    const url = `${base}#${hash}`;
    const outDir = resolve(args.out ?? process.cwd());
    const name = args.name ?? 'character';
    const timeout = Number(args.timeout ?? 60000);
    mkdirSync(outDir, { recursive: true });

    const pngPath = join(outDir, `${name}.png`);
    const creditsPath = join(outDir, `${name}.credits.txt`);

    const browser = await chromium.launch({ headless: !args.headed });
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout }).catch(async () => {
            // networkidle can be flaky on a busy app; fall back to domcontentloaded.
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        });
        // Boot complete: renderer global set + download buttons mounted.
        await page.waitForFunction(() => !!window.canvasRenderer, null, { timeout });
        await page.locator('#download-buttons').getByRole('button', { name: 'Spritesheet (PNG)', exact: true }).waitFor({ timeout });

        const settled = await waitForRenderSettle(page, timeout);

        const png = await clickAndSave(page, 'Spritesheet (PNG)', pngPath, timeout);
        const credits = await clickAndSave(page, 'Credits (TXT)', creditsPath, timeout);

        const creditsTxt = readFileSync(credits, 'utf8');
        const summary = {
            ok: true,
            url,
            png,
            credits,
            pngBytes: statSync(png).size,
            creditEntries: countCreditEntries(creditsTxt),
            settled,
            warnings: [],
        };
        if (!settled) summary.warnings.push('render did not visibly settle within timeout; PNG may be incomplete');
        if (summary.creditEntries === 0)
            summary.warnings.push('0 credited assets — the hash likely matched nothing (check token spelling/colors)');
        if (pageErrors.length) summary.warnings.push(`page errors: ${pageErrors.slice(0, 3).join(' | ')}`);

        console.log(JSON.stringify(summary));
    } finally {
        await context.close();
        await browser.close();
    }
}

main().catch((err) => {
    console.log(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }));
    process.exit(1);
});
