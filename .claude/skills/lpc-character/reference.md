# LPC generator — technical reference

The contract the skill's scripts rely on. Read this before assembling a hash by hand.

## The hosted generator

- Base URL: `https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/`
- It is a **client-side** app (no server API). A character is fully encoded in the URL
  **hash** (`#…`). Opening that URL reconstructs the character; the page then composites
  every layer onto an offscreen canvas (correct z-order + palette recolors) and exposes
  download buttons. `export.mjs` opens the URL and clicks those buttons.

## Hash grammar

The fragment is `key=value` pairs joined by `&`, each side `encodeURIComponent`-encoded
(so a space → `%20`, `|` → `%7C`; `_` is preserved). `export.mjs` does this encoding for
you — author tokens with literal spaces/underscores.

```
#sex=male&head=Zombie_bright_green&expression=Neutral&body=Body_Color_light&clothes=Robe_blue
```

- **`sex`** — the body build. One of `catalog.bodyTypes`: `male`, `female`, `muscular`,
  `teen`, `pregnant`, `child`. Always include it.
- **Every other key is a `type_name`** (e.g. `head`, `body`, `hair`, `clothes`, `legs`,
  `weapon`, `hat`, `expression`, `wound_brain`, …). The full list is `catalog.types`.

### The value: `Name[_colorOrVariant]`

For `type=value`, the resolver (`resolveHashParamFromHashMatch`) does:

1. Take the item **Name** with spaces replaced by `_` — e.g. `"Body Color"` → `Body_Color`,
   `"Zombie"` → `Zombie`. It greedily matches the longest item name prefix.
2. Whatever follows the name is the **colour / variant**, matched against the item's options:
    - items with a `variants` list (e.g. Robe → `black`,`blue`,`dark brown`,…) — use that string verbatim;
    - items with a `recolor` material — use one of `catalog.colorsByMaterial[material]`
      (e.g. body → `light`,`tan`,`bronze`,`bright_green`,`zombie`,…).
3. Advanced: `Name_variant|recolor` sets both a base variant and a recolor (rare; the quiz never needs it).

### ⚠️ The one rule that matters

- **Name-only always works** and uses the item's default colour: `head=Zombie`, `clothes=Robe`.
- A **wrong/invalid colour silently drops the whole item** (no match → not rendered).
  So only append a colour you've verified against the catalog for that exact item. When unsure,
  emit name-only.

Examples (all verified):
| intent | token |
|---|---|
| muscular male build | `sex=muscular` |
| green zombie skin | `body=Body_Color_bright_green` |
| zombie head, green | `head=Zombie_bright_green` |
| blue robe | `clothes=Robe_blue` |
| robe, "dark brown" (space ok) | `clothes=Robe_dark brown` |
| neutral expression | `expression=Neutral` |
| red brain wound | `wound_brain=Brain_red` |
| longsword (name-only) | `weapon=Longsword` |
| steel spear (metal variant) | `weapon=Spear_steel` |
| round shield | `shield=Round_Shield` |

Keep skin colour consistent: if `body` and a `recolor: body` head both take a colour, give them the same one.

## Not in the catalog (advanced / deferred)

- **Multi-channel recolors** (e.g. a human head's separate skin + eye-colour regions) and
  other linked sub-layers are _not_ enumerated in `catalog.json`. The quiz doesn't expose them.
  `export.mjs` still renders any valid hash, so such params can be appended manually if a user
  knows the exact token. (TODO: harvest `recolors.color_N` channels into the catalog.)

## export.mjs output & summary

Writes `<name>.png` (the full universal spritesheet, e.g. 832×3456 RGBA) and
`<name>.credits.txt`. Prints one JSON line:

```json
{
    "ok": true,
    "url": "…",
    "png": "…/zombie.png",
    "credits": "…/zombie.credits.txt",
    "pngBytes": 319770,
    "creditEntries": 4,
    "settled": true,
    "warnings": []
}
```

- `creditEntries: 0` → the hash matched nothing (bad tokens). Investigate before delivering.
- `settled: false` → render didn't visibly stabilise in time; PNG may be partial — re-run.
- `ok:false` → `error` holds the stack (network down, Chromium missing, selector change).

## Licensing — always deliver the credits

All LPC art is **GPL-3.0 and/or CC-BY-SA-3.0** with per-asset attribution. `credits.txt`
lists the required authors/licenses/links and **must ship with the sprites**. Never hand over
the PNG alone.

## Refreshing the catalog

`catalog.json` is generated from the upstream repo. To rebuild (e.g. after upstream adds assets):

```bash
git clone --no-checkout --depth 1 --filter=tree:0 \
  https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator.git /tmp/lpc
cd /tmp/lpc && git sparse-checkout set --no-cone sheet_definitions palette_definitions && git checkout
node <skill>/scripts/build-catalog.mjs /tmp/lpc <skill>/catalog.json
```
