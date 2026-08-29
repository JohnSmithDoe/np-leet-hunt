---
name: event-images
description: Generate event hero images from event-image-prompts.md by driving DeepAI's text2img page, saving each one straight into the events asset folder under its event key. Use when the user wants to generate, re-generate, or check the status of event images — "generate the next batch", "try the images again", "which events still need art", or after adding new prompts to event-image-prompts.md.
---

# Event hero images

One establishing image per event, generated from `event-image-prompts.md` and written to
`libs/np-space-map/src/assets/events/<event-key>.jpeg`.

`scripts/generate.mjs` drives <https://deepai.org/machine-learning-model/text2img> exactly the way a
person would — paste the prompt, click **Generate**, click **Download** — then saves the download under
the event key. That last step is the point: doing it by hand leaves UUID-named files in `~/Downloads`
that then have to be matched back to their prompts by eye.

The script needs network access and the repo's `playwright-core` plus system Google Chrome (`channel: 'chrome'`,
so there's no bundled-browser download).

## Commands

```bash
node .claude/skills/event-images/scripts/generate.mjs --list                 # status of all 132 events
node .claude/skills/event-images/scripts/generate.mjs --sector frozen --list # one sector
node .claude/skills/event-images/scripts/generate.mjs --sector frozen        # generate that sector's missing images
node .claude/skills/event-images/scripts/generate.mjs --keys a,b             # named events only
node .claude/skills/event-images/scripts/generate.mjs --limit 1              # validate before a long run
node .claude/skills/event-images/scripts/generate.mjs --dry-run              # print assembled prompts, generate nothing
node .claude/skills/event-images/scripts/generate.mjs --headless             # no visible window
```

`--sector` matches either the key prefix (`frozen`, `home`, `veiled`, `quiet`, `ember`) or the section
heading. With no selector it takes **every** event still missing an image.

## Workflow

1. **`--list` first.** It shows what's already generated (`✓`) and what isn't (`·`). Existing files are
   always skipped, so runs are resumable — re-running after a quota block picks up where it stopped.
2. **`--limit 1` before a long batch**, especially if the page markup may have shifted. Twelve
   sequential generations take a while and it's worth knowing the selectors still bind.
3. **Run it.** Report which keys landed and which didn't.
4. **Re-generating one image**: delete the file first, or the key will be skipped as already done.

## Image shape

Aspect ratio is a **page control, not a prompt instruction** — `Landscape 16:9` in the prompt did
nothing and has been removed from `event-image-prompts.md`. The script now picks the shape before every
submit: open the row if collapsed (`#modelEditButton` toggles `#suboutline-try-it`), click
`#edit_shape_N`, and confirm the element's `iscurrentshape` attribute flipped to `True`.

`SHAPE = 1` in `generate.mjs` — always. The five options map to these pixel sizes (read off the
multipart `width`/`height` fields of the generate POST):

| shape | size    | ratio                   |
| ----- | ------- | ----------------------- |
| 1     | 832×448 | 1.86 — widest landscape |
| 2     | 768×576 | 4:3 — the site default  |
| 3     | 640×640 | 1:1                     |
| 4     | 576×768 | 3:4                     |
| 5     | 448×832 | 9:16                    |

Nothing is exactly 16:9; shape 1 is the closest. Images generated before this change are 768×576, so
the asset folder is mixed until they are regenerated.

## The anonymous quota

There is no account. DeepAI's anonymous allowance is undocumented, has no published reset window, and
is presumably IP-based. When it's spent the page shows `anonymous try it exceeded` in `#tryItResultError`;
the script recognises that, stops the batch immediately rather than burning through the rest, and
**exits 2** — so exit code 2 means "blocked, try later", 1 means "something actually broke".

Reset duration is unknown. **Wait for the user to say when to retry** — don't poll it on a timer.

A persistent Chrome profile lives in `scripts/.chrome-profile` (gitignored) so the anonymous session is
reused instead of appearing as a brand-new visitor each run.

## Page selectors

Verified against the live page; re-probe these first if a run fails oddly.

| element                      | selector                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ |
| prompt textarea              | `#generate-textarea`                                                     |
| submit                       | `#modelSubmitButton`                                                     |
| download (hidden until done) | `#download-button`                                                       |
| error / quota line           | `#tryItResultError`                                                      |
| promo modal / banner dismiss | `#close-promo-modal`, `#dismiss-banner`                                  |
| shape row toggle             | `#modelEditButton` → `#suboutline-try-it`                                |
| shape buttons                | `#edit_shape_1` … `#edit_shape_5` (selection read from `iscurrentshape`) |

`#download-button` becoming visible **is** the completion signal — the result `<img>` src is a ~2 KB
placeholder before the real image lands, so waiting on the image element yields a truncated file.
Don't fetch that src from inside the page either: it's cross-origin and the page's own `fetch` is
CORS-blocked. The download event is the reliable path.

## Prompt assembly

`event-image-prompts.md` is the only source. The script composes each prompt as:

```
<Global Style Prefix> <Sector Style line> <event scene prompt>
```

pulling the prefix from its fenced block, matching the sector line to the `##` section heading, and
stripping markdown emphasis so `_Momo_` doesn't reach the generator as literal underscores. **Add new
events by adding a bullet to that file** — `- **`event-key`** — scene description.` — and they appear in
`--list` automatically. Nothing else needs editing.

Note `event-image-prompts.md` carries an `xxxxxx` progress marker in the Frozen Drift section. It's a
human bookmark only; the script ignores it and uses the presence of the file on disk as truth.

## Open issues — fix before the next big batch

**1. Fake signatures.** The model likes to sign its work: a cursive artist name, a year, or an invented
studio wordmark painted into the bottom-right corner (found in 8 of the first 50 images — e.g.
`Pelia Stinige`, `AULLISTERIK ROOSTIMARRY`). `event-image-prompts.md`'s prefix now carries an
`Unsigned:` clause, but that is unproven — **inspect the bottom-right corner of every new image**
(crop the bottom ~15%, upscale ~4×, normalise) before accepting it.

**2. Prompt length.** `#generate-textarea` has **no `maxlength`** (verified — 1500 chars accepted), so
there is no client-side cap. The risk is the model, not the field: assembled prompts now run 806–989
chars, and SD-family text encoders attend to only ~77 tokens (~300–400 chars), so everything after the
style prefix — including the scene itself — may simply never be read. If the `Unsigned:` clause or the
scene description gets ignored, shorten the prefix and put what matters first. No negative-prompt field
was found on the page.

## After generating

Images are referenced by in-game `load` calls as `np-space-map/events/<key>.jpeg` (the app's build
target copies each library's assets to a folder named after the lib). `attribution.md` in the asset
folder credits DeepAI text2img and points back at the prompts file — no per-image edit needed.
