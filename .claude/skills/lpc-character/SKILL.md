---
name: lpc-character
description: Generate a Universal LPC character spritesheet (PNG) + credits.txt by running a quiz against the generator's real options. Use when the user wants to create/generate an LPC character, a Liberated Pixel Cup sprite/spritesheet, a game character sprite from the LPC generator, or pastes a liberatedpixelcup.github.io URL.
---

# LPC character generator

Turn a short interactive quiz into a finished **character spritesheet PNG + credits.txt**,
driving the hosted Universal LPC Spritesheet Character Generator headlessly. Options are
**preloaded** in `catalog.json` (the real upstream vocabulary), so every question and token is grounded.

**Requires network access** (the generator is hosted) and Playwright + a Chromium build
(this repo ships both). Files here:

| file                        | role                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `catalog.json`              | preloaded options: `bodyTypes`, `colorsByMaterial`, `types` → items (with `variants`/`recolor`) |
| `reference.md`              | hash grammar + mapping rules + the gotchas — **read before building a hash**                    |
| `scripts/export.mjs`        | Playwright: hash → `<name>.png` + `<name>.credits.txt`                                          |
| `scripts/build-catalog.mjs` | regenerate `catalog.json` from the upstream repo                                                |

## Workflow

### 0. Preflight

Read `reference.md` (the hash rules) and load `catalog.json`. If a user pasted a generator
URL, you can skip the quiz and go straight to step 3 with its `#fragment`.

### 1. Run the quiz (grounded in `catalog.json`)

Ask with the `AskUserQuestion` tool, pulling option labels from `catalog.json` so they're real.
Each `AskUserQuestion` option list auto-includes "Other" for free text — lean on it for the long
tail (45 heads, 91 hairstyles, 36 weapons, etc.). Keep it to ~3 rounds; offer a 4th only for flourishes.

**Round 1 — identity** (one call, up to 4 questions):

- **Build** → `catalog.bodyTypes` (`male`, `female`, `muscular`, `teen`, …)
- **Body kind** → `catalog.types.body.items` (Human "Body Color", Zombie, Skeleton)
- **Head / face** → representative `catalog.types.head.items` (e.g. Human, Elf-ish, Orc/Goblin, Zombie, Skeleton, Alien, Beast) + Other
- **Hair** → a few `catalog.types.hair.items` + "Bald/None" + Other

**Round 2 — colour & outfit** (now you know the body kind, so offer the right colours):

- **Skin / body colour** → from `catalog.colorsByMaterial.body`; surface human tones
  (`light`,`tan`,`brown`,`olive`) for a Human body, or greens (`bright_green`,`dark_green`,`zombie`,`pale_green`) for a Zombie
- **Top** → `catalog.types.clothes.items` (Longsleeve, Robe, Dress, Armour…) + None
- **Legs** → `catalog.types.legs.items` (Pants, Skirt, Shorts…) + None
- **Feet** → `catalog.types.shoes.items` (+ `socks`) + None

**Round 3 — weapon & gear** (ask by default — don't skip the weapon):

- **Weapon** → `catalog.types.weapon.items` (e.g. Longsword, Dagger, Saber, Scimitar, Katana,
  Spear, Trident, Mace, Waraxe, Scythe, Whip, Club; bows = Recurve / Crossbow / Slingshot;
  staves/magic = Simple staff, Gnarled staff, Diamond staff, Wand, Rod) + **None**.
  Most weapons are name-only; the metal ones (Arming Sword, Spear, Trident) take a metal
  variant (`iron`, `steel`, `gold`, `bronze`, `silver`, `brass`, `copper`, `ceramic`).
- **Shield** → `catalog.types.shield.items` (Round Shield, Kite, Heater Shield Base, Spartan
  Shield, Scutum shield…) + None.
- **Expression** → `catalog.types.expression.items` (Neutral, Angry, Happy…).
- **Headwear** → `catalog.types.hat.items` + None.

**Round 4 — flair** (optional, only if they want it): extras like `beard`, `mustache`, `wings`,
`tail`, `cape` (a multi-select works well here).

If the user instead describes the character in prose, skip the quiz and map their words to items.

### 2. Assemble the hash (per `reference.md`)

For each answer pick the matching catalog item and build `type_name=Name[_color]`:

- Replace spaces in the **Name** with `_` (`"Body Color"` → `Body_Color`).
- Append a colour **only if it's valid for that item** — check `item.variants` (verbatim) or
  `catalog.colorsByMaterial[item.recolor]`. **If unsure, emit name-only** (default colour) —
  a wrong colour silently drops the item.
- Always include `sex=…`, a `body=…`, and a `head=…` so the base character is complete.
- Keep skin colour consistent between `body` and a `recolor: body` head.

Don't hand-encode spaces — `export.mjs` does the `encodeURIComponent`. Author literal tokens.

### 3. Render

Pick an output dir (ask the user, or default to the current directory) and a slug for `--name`:

```bash
node .claude/skills/lpc-character/scripts/export.mjs \
  --out <dir> --name <slug> \
  --hash "sex=male&body=Body_Color_bright_green&head=Zombie_bright_green&expression=Neutral&clothes=Robe_blue"
```

(Or `--url "<full generator url>"`, or `--params '<json>'` / `--params @file.json`.)

### 4. Deliver

Parse the JSON summary line. Report the two file paths and:

- If `creditEntries` is 0 → tokens matched nothing; fix spelling/colours and re-run (don't deliver).
- If `settled:false` or `warnings` is non-empty → mention it; re-run if the PNG looks wrong.
- **Always** hand over `credits.txt` alongside the PNG and remind the user that LPC art is
  GPL-3.0 / CC-BY-SA-3.0 and the attribution must ship with the sprites.

## Maintenance

Refresh `catalog.json` from upstream with `scripts/build-catalog.mjs` — see the command at the
bottom of `reference.md`.
