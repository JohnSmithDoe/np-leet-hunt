/**
 * Data model + tuning for the grey-fight colony — the ship's turn-based incremental (GDD §4 "Holding the
 * Grey", `docs/grey-fight/design.md`). Pure data, no Phaser: the engine (`grey-fight.ts`) and the scene
 * (`grey-fight.scene.ts`) both build on it.
 *
 * The 2026-06-28 pivot turned this from a real-time clicker into a TURN/ROUND game with **locations**
 * (contested frontier → reclaimed home), per-location **cultivation**, and per-cat **evolution**. Every
 * number is now per-turn — there is no time axis anywhere in the model.
 */

/** Whether the current grey-mass is a normal bay or the in-round boss-mass guarding the next one. */
export type GreyPhase = 'bay' | 'boss';

/** A location's life-stage: a `contested` frontier you fight, or a `reclaimed` home you cultivate. */
export type LocationPhase = 'contested' | 'reclaimed';

/**
 * The six upgrade *families* (Damage / Crit / Cats / Endurance / Economy / Openers). No longer separate page
 * columns — the page is now a SINGLE connected tree — but the family still drives an upgrade card's accent
 * colour (see {@link TREES}).
 */
export type TreeId = 'dmg' | 'crit' | 'cats' | 'endurance' | 'economy' | 'openers' | 'aim';

/** The stat an upgrade node feeds; the engine knows how to combine each. */
export type StatKind =
    | 'tapFlat' // + flat tap damage
    | 'tapMult' // + into the tap-damage multiplier ×(1 + Σ)
    | 'critChance' // + crit chance (capped)
    | 'critMult' // + crit-damage multiplier
    | 'catFlat' // + flat per-turn cat strike
    | 'catMult' // + into the cat-strike multiplier ×(1 + Σ)
    | 'lightMult' // + into the light-gain multiplier ×(1 + Σ) — Economy tree
    | 'regenMult' // × grey-regen reduction (perLevel^level, perLevel < 1) — Damage tree "Overwhelm"
    | 'staminaFlat' // + max stamina (turns per round) — Endurance tree
    | 'openerBay' // + starting bay of a round — Openers tree
    | 'spawnFlat' // + grey-cloud spawn rate (clouds/sec) — Aim tree
    | 'cloudFlat' // + max simultaneous clouds — Aim tree
    | 'hitFlat' // + tap hit radius (px, aim forgiveness) — Aim tree
    | 'chargedFlat'; // + charged-cloud chance (gold cloud → crit + bonus light) — Aim tree

/**
 * A specialist's signature ability (GDD §4 roster, design.md §Cats). The robo-cat and generic kittens keep
 * contributing flat per-turn `strike`; each named cat is a distinct striker. The passive kinds fold into the
 * per-turn getters; `burst` (Comet) is the one dynamic, per-turn proc handled in the combat turn.
 */
export type CatAbility =
    | 'strike' // flat per-turn strike, no special effect (robo-cat + kittens)
    | 'multiHit' // Scuff: × tapDamage (your taps multi-swipe)
    | 'crewMult' // Nona: × catStrike, scaling with roster size
    | 'lightMult' // Glimmer: × light-per-damage factor
    | 'regenSuppress' // Blink: × the grey's regenPerTurn (down)
    | 'burst' // Comet: a periodic burst added to the player's strike
    | 'wildcard'; // Tinker: × both tapDamage and catStrike, scaling with your most-leveled tree

/** A cat the colony can free — its identity, signature ability, and the accent color it restores (cat-codex.md). */
export interface CatDef {
    id: string;
    name: string;
    /** This cat's signature ability — what makes it a distinct striker (GDD §4 roster). */
    ability: CatAbility;
    /** A short display line for the HUD describing the ability (e.g. "Multi-swipe: bigger taps"). */
    blurb: string;
    /** The accent color this cat restores, as a Phaser RGB int. */
    color: number;
}

/** A freed cat: a {@link CatDef} plus the per-turn strike it contributes (incl. its evolution bonus). */
export interface FreedCat extends CatDef {
    /** Per-turn strike, base + `evoStrikePerLevel × evoLevel`, before any Cats-tree multipliers. */
    strike: number;
    /** How many times this cat has been evolved with its location's resource (forward-only). */
    evoLevel: number;
}

/**
 * Fields shared by every node in the single connected skill tree (GDD §4): a stable id, display copy, the
 * single-parent link that builds the tree, and a static world position for the draggable tree page.
 *
 * **Reveal model:** a node is shown only once its parent is *acquired* (the root — `requires` absent — is
 * always shown). "Acquired" means a {@link StatNode} bought to level ≥ 1, or a {@link CatNode} whose cat is
 * freed in combat. So buying a node unfolds its children, and freeing a cat unfolds its branch.
 */
interface TreeNodeBase {
    id: string;
    name: string;
    desc: string;
    /** Id of this node's single parent; absent only on the root. The tree is built from these links. */
    requires?: string;
    /** World position on the page (the camera/page is dragged over these). */
    x: number;
    y: number;
}

/**
 * A light-funded upgrade node — the existing mechanic: bought level by level, geometric cost, feeding a
 * {@link StatKind}. Carries a {@link TreeId} `tree` family for its card accent colour.
 */
export interface StatNode extends TreeNodeBase {
    kind: 'upgrade';
    tree: TreeId;
    stat: StatKind;
    /** The stat contribution added (or, for regenMult, the per-level factor) per bought level. */
    perLevel: number;
    baseCost: number;
    /** Cost ×`costGrowth` per level already bought. */
    costGrowth: number;
    maxLevel: number;
}

/**
 * A gate node for one of the six named cats. NOT buyable: it auto-acquires the moment the cat is freed in
 * combat (the cat lands in the engine's roster). It carries no stat/cost — it only reveals its branch and
 * mirrors the cat's identity (the scene renders it in the cat's colour).
 */
export interface CatNode extends TreeNodeBase {
    kind: 'cat';
    /** The {@link CatDef.id} of the cat that frees this node (scuff/nona/glimmer/blink/comet/tinker). */
    catId: string;
}

/** A node in the single connected skill tree — a buyable {@link StatNode} or an auto-freed {@link CatNode}. */
export type TreeNode = StatNode | CatNode;

/**
 * @deprecated kept as an alias to the pre-rework name. The tree now holds both upgrade and cat nodes; prefer
 * {@link TreeNode} / {@link StatNode} / {@link CatNode}.
 */
export type UpgradeNode = TreeNode;

/** Display metadata for an upgrade *family* (title + accent color used on its cards). */
export interface TreeMeta {
    id: TreeId;
    title: string;
    color: number;
}

/** A location in the colony: a contested frontier or a reclaimed, cultivated home. */
export interface LocationState {
    /** Position in the ordered colony row; also indexes {@link CAT_ROSTER} for the cat it houses. */
    index: number;
    /** The cat this location houses/frees (then a kitten id past the named roster). */
    catId: string;
    phase: LocationPhase;
    /** Forward-only cosmetic colour depth, advanced by cultivating a reclaimed home. */
    colorTier: number;
    /** Banked signature resource (from cultivation), spent on evolving this location's cat. */
    resource: number;
}

/** A transition worth celebrating in the view — a discriminated union the scene reacts to. */
export type GreyFightEvent =
    | { kind: 'enteredBoss'; bay: number }
    | { kind: 'freedCat'; cat: FreedCat }
    | { kind: 'reclaimedLocation'; index: number }
    | { kind: 'openedLocation'; index: number }
    | { kind: 'colorTierUp'; index: number; tier: number }
    | { kind: 'catEvolved'; catId: string; level: number }
    | { kind: 'roundOver' };

/** What a single combat turn produced — for the view to pop numbers and splash a crit. */
export interface CombatTurnResult {
    kind: 'combat';
    /** Your strike this turn (after a possible crit). */
    tapDamage: number;
    crit: boolean;
    /** Total cat strike this turn. */
    catStrike: number;
    /** Grey self-heal applied this turn. */
    regen: number;
    /**
     * Net HP the grey actually lost this turn = (you + cats) − the heal it managed, clamped ≥ 0 (0 if its
     * regen out-paced your strike). Light + roundDamage instead bank your full output.
     */
    damage: number;
    /** Light banked this turn from the damage dealt. */
    light: number;
    /** True when Comet's periodic burst fired this turn (the view flashes it). */
    burst: boolean;
    /** True when this strike popped a charged (gold) cloud — forced a crit and multiplied the light. */
    charged: boolean;
}

/** What a single cultivation turn produced at a reclaimed home — a friendly play-beat. */
export interface CultivateTurnResult {
    kind: 'cultivate';
    /** Signature resource yielded into the location this turn. */
    resourceGained: number;
    /** Whether this play-beat advanced the location's colour tier. */
    colorTierUp: boolean;
}

/** A no-op turn — the round is over (stamina spent), or there is nothing to act on. */
export interface NoTurnResult {
    kind: 'none';
}

/** The outcome of a single {@link GreyFight.takeTurn} — combat, cultivation, or a no-op. */
export type TurnResult = CombatTurnResult | CultivateTurnResult | NoTurnResult;

/** A read-only snapshot of one location for the HUD. */
export interface LocationSnapshot {
    index: number;
    catId: string;
    phase: LocationPhase;
    colorTier: number;
    resource: number;
}

/** A read-only snapshot of one freed cat for the HUD. */
export interface CatSnapshot {
    id: string;
    name: string;
    ability: CatAbility;
    blurb: string;
    color: number;
    strike: number;
    evoLevel: number;
}

/** A read-only view of the engine's state, rich enough to drive a HUD and the tests. */
export interface GreyFightSnapshot {
    /** Which location the round/turns act on right now. */
    activeLocationIndex: number;
    /** The active location's phase — fighting (`contested`) or cultivating (`reclaimed`). */
    activePhase: LocationPhase;
    locations: LocationSnapshot[];
    // In-round fight state (meaningful when activePhase === 'contested').
    bay: number;
    phase: GreyPhase;
    greyHp: number;
    greyMax: number;
    // Round budget.
    stamina: number;
    maxStamina: number;
    isRoundOver: boolean;
    roundDamage: number;
    bestRoundDamage: number;
    // Persistent economy.
    light: number;
    cats: CatSnapshot[];
    // Per-turn stats.
    tapDamage: number;
    critChance: number;
    critMult: number;
    catStrike: number;
    regenPerTurn: number;
    /** you + cats − regen for the active contested fight (negative ⇒ the wall is winning). */
    netPerTurn: number;
    // The next cat gate.
    nextCatThreshold: number;
    nextCatName: string;
}

/**
 * Tuning constants for the loop. SKETCH values — real balance is a playtest job (design.md §"Open design
 * threads"). The curves are set so a few turns clear the first bay, Scuff frees within the first or second
 * round, and regen grows a touch faster than HP so walls reappear deeper in a round.
 */
export interface GreyFightTuning {
    /** Bay-1 clear HP; clear threshold = baseHp × hpGrowth^bay. */
    baseHp: number;
    /** Per-bay HP growth. */
    hpGrowth: number;
    /** Bay-0 grey self-heal per turn; regen = baseRegen × regenGrowth^bay. */
    baseRegen: number;
    /** Per-bay regen growth (> hpGrowth, so walls reappear). */
    regenGrowth: number;
    /** Boss-mass HP multiple of a bay's clear threshold. */
    bossHpMult: number;
    /** Boss-mass regen multiple of a bay's regen. */
    bossRegenMult: number;
    /** Tap damage before any Damage-tree nodes. */
    tapBase: number;
    /** Per-turn strike each freed cat (and the robo-cat) contributes before Cats-tree nodes/evolution. */
    catStrike: number;
    /** Base light gained per point of damage dealt. */
    lightPerDamage: number;
    /** Crit damage multiplier before any Crit-tree nodes. */
    critMultBase: number;
    /** Hard ceiling on crit chance. */
    critChanceCap: number;
    /** Max stamina (turns per round) before any Endurance-tree nodes. */
    baseStamina: number;
    /** Single-round damage to free the first frontier cat; threshold = base × growth^locationIndex. */
    catThresholdBase: number;
    /** Per-location growth of the free-a-cat damage threshold. */
    catThresholdGrowth: number;
    /** Resource yielded per point of (tap + cat) output on a cultivation turn. */
    resourceFactor: number;
    /** Cultivation play needed for the first colour tier; cost = base × growth^tier. */
    colorTierCost: number;
    /** Per-tier growth of the colour-tier cost. */
    colorTierGrowth: number;
    /** Resource for a cat's first evolution; cost = base × growth^evoLevel. */
    evoCostBase: number;
    /** Per-level growth of an evolution cost. */
    evoCostGrowth: number;
    /** Per-turn strike a cat gains per evolution level. */
    evoStrikePerLevel: number;

    // --- Per-cat specialist abilities (scale with level = evoLevel + 1; SKETCH values, balance is a later job). ---
    /** Scuff (multiHit): tapDamage × (1 + scuffSwipe × level). */
    scuffSwipe: number;
    /** Nona (crewMult): catStrike × (1 + nonaPerCat × level × (catCount − 1)). */
    nonaPerCat: number;
    /** Glimmer (lightMult): light-per-damage factor × (1 + glimmerLight × level). */
    glimmerLight: number;
    /** Blink (regenSuppress): regenPerTurn × max(blinkFloor, 1 − blinkSuppress × level). */
    blinkSuppress: number;
    /** Blink (regenSuppress): the lowest the regen multiplier can fall (so regen is never fully nulled). */
    blinkFloor: number;
    /** Comet (burst): every cometPeriod-th combat turn of a round fires the burst. */
    cometPeriod: number;
    /** Comet (burst): burst added to the player's strike = tapDamage × cometBurst × level. */
    cometBurst: number;
    /** Tinker (wildcard): tapDamage and catStrike × (1 + tinkerBonus × level × maxTreeLevels). */
    tinkerBonus: number;
    /** Grey-cloud spawn rate (clouds/sec) before Aim-tree nodes — how fast tap targets appear. */
    baseSpawnRate: number;
    /** Max grey clouds present at once before Aim-tree nodes — more targets, less waiting. */
    baseMaxClouds: number;
    /** Tap hit radius (px) before Aim-tree nodes — the size of a cloud's tappable area (aim forgiveness). */
    baseHitRadius: number;
    /** Hard ceiling on charged-cloud chance. */
    chargedChanceCap: number;
    /** A charged (gold) cloud multiplies the turn's light by this (and forces a crit). */
    chargedLightMult: number;
}

export const DEFAULT_TUNING: GreyFightTuning = {
    baseHp: 30,
    hpGrowth: 1.75,
    baseRegen: 2,
    // regenGrowth > hpGrowth (1.75) so the grey's heal pulls ahead per bay — deep bays re-wall once the tree
    // tops out, which is what forces the spend-to-break rhythm. (Tuned up from 1.8 in the 2026-06 balance pass.)
    regenGrowth: 1.85,
    bossHpMult: 5,
    bossRegenMult: 1.5,
    tapBase: 6,
    catStrike: 1.5,
    // Light income per point of damage. Trimmed 0.5 → 0.2 so banked light paces the climb (you can afford
    // something most rounds, but not flood the whole tree at once) instead of trivially out-running every cost.
    lightPerDamage: 0.2,
    critMultBase: 2,
    critChanceCap: 0.6,
    baseStamina: 20,
    // 250 → 120 so the very first round (baseStamina 20, ~7.5 dmg/turn ⇒ ~150 round damage) clears Scuff's gate
    // comfortably (~45 damage of headroom).
    catThresholdBase: 120,
    // ×2.8/cat paces the spine: roughly one new specialist every few rounds (all six in ~30 engaged rounds)
    // rather than several popping in a single early round. Still well under the reachable round-damage ceiling,
    // so the deepest gate (Tinker) stays freeable — the DEFAULT_TUNING reachability test guards this.
    catThresholdGrowth: 2.8,
    resourceFactor: 0.5,
    colorTierCost: 30,
    colorTierGrowth: 1.6,
    evoCostBase: 25,
    evoCostGrowth: 1.7,
    evoStrikePerLevel: 1,
    scuffSwipe: 0.4,
    nonaPerCat: 0.06,
    glimmerLight: 0.5,
    blinkSuppress: 0.12,
    blinkFloor: 0.15,
    cometPeriod: 5,
    cometBurst: 3,
    tinkerBonus: 0.01,
    baseSpawnRate: 1.6,
    baseMaxClouds: 3,
    baseHitRadius: 64,
    chargedChanceCap: 0.5,
    chargedLightMult: 4,
};

export const TREES: readonly TreeMeta[] = [
    { id: 'dmg', title: 'Damage', color: 0xff6a3d },
    { id: 'crit', title: 'Crit', color: 0xffcf6a },
    { id: 'cats', title: 'Cats', color: 0x6fb7ff },
    { id: 'endurance', title: 'Endurance', color: 0x7be37b },
    { id: 'economy', title: 'Economy', color: 0xf2d06a },
    { id: 'openers', title: 'Openers', color: 0xb07bff },
    { id: 'aim', title: 'Aim', color: 0x8fe3ff },
];

/** The robo-cat — the eldest, owned from the first moment, NOT tied to a location (GDD §4 The robo-pet). */
export const ROBO_CAT: CatDef = {
    id: 'robo-cat',
    name: 'the robo-cat',
    ability: 'strike',
    blurb: 'Steadfast: strikes every turn',
    color: 0x6fb7ff,
};

/** The specialists freed at single-round records, in order (cat-codex.md). Beyond these, records give kittens. */
export const CAT_ROSTER: readonly CatDef[] = [
    { id: 'scuff', name: 'Scuff', ability: 'multiHit', blurb: 'Multi-swipe: bigger taps', color: 0xff6a3d },
    { id: 'nona', name: 'Nona', ability: 'crewMult', blurb: 'Crew: ×all cats', color: 0xffcf6a },
    { id: 'glimmer', name: 'Glimmer', ability: 'lightMult', blurb: 'Prism: ×light', color: 0xff5ec4 },
    { id: 'blink', name: 'Blink', ability: 'regenSuppress', blurb: 'Hold: −grey heal', color: 0x3fd0c8 },
    { id: 'comet', name: 'Comet', ability: 'burst', blurb: 'Burst: periodic huge hit', color: 0xf2f6ff },
    { id: 'tinker', name: 'Tinker', ability: 'wildcard', blurb: 'Wildcard: boosts your top tree', color: 0xb07bff },
];

/** Roster lookup by cat id, for building the spine's cat gate nodes (and any HUD cat lookups). */
const CAT_BY_ID: Readonly<Record<string, CatDef>> = Object.fromEntries(CAT_ROSTER.map(cat => [cat.id, cat]));

/**
 * Build a {@link CatNode} for one of the six named cats: a non-buyable gate that auto-acquires when the cat is
 * freed, named after the cat and described by its {@link CatDef.blurb}. Its `id` is the cat's id (so the scene
 * can tint it in the cat's colour and the engine can check `#cats` directly).
 */
function catNode(catId: string, requires: string, x: number, y: number): CatNode {
    const def = CAT_BY_ID[catId];
    return { id: catId, kind: 'cat', catId, name: def.name, desc: def.blurb, requires, x, y };
}

/**
 * The single **connected skill tree** (GDD §4, rework 2026-06-28). Every node has exactly one `requires`
 * parent reachable from the root `d1`, so the whole thing is one tree. Two kinds interleave:
 *
 * - `upgrade` ({@link StatNode}) — light-funded, level by level, feeding a stat.
 * - `cat` ({@link CatNode}) — NOT buyable; auto-acquired the instant the cat is freed in combat.
 *
 * The six named cats sit on the **central spine** (`d1 → scuff → nona → glimmer → blink → comet → tinker`,
 * x = 1000), with upgrade branches hanging off each. The tree **unfolds** by the reveal rule (a node shows
 * once its parent is acquired — see {@link TreeNodeBase}), so freeing a cat opens the upgrades gated behind
 * it. Layout is a vertical tree, root at top, `y = 120 + depth × 200`. `baseCost` trends up with depth
 * (deeper = later-game). All ten {@link StatKind}s are covered. SKETCH tuning — balance is a playtest job.
 */
export const UPGRADE_NODES: readonly TreeNode[] = [
    // depth 0 — root.
    { id: 'd1', kind: 'upgrade', tree: 'dmg', name: 'Sharper Taps', desc: '+2 tap dmg', stat: 'tapFlat', perLevel: 2, baseCost: 10, costGrowth: 1.18, maxLevel: 25, x: 1000, y: 120 }, // prettier-ignore
    // depth 1.
    { id: 'c1', kind: 'upgrade', tree: 'crit', name: 'Lucky Strike', desc: '+3% crit', stat: 'critChance', perLevel: 0.03, baseCost: 30, costGrowth: 1.22, maxLevel: 16, requires: 'd1', x: 640, y: 320 }, // prettier-ignore
    { id: 'k1', kind: 'upgrade', tree: 'cats', name: 'Adopt a Stray', desc: '+1.5 cat strike', stat: 'catFlat', perLevel: 1.5, baseCost: 20, costGrowth: 1.18, maxLevel: 25, requires: 'd1', x: 1360, y: 320 }, // prettier-ignore
    catNode('scuff', 'd1', 1000, 320),
    // depth 2.
    { id: 'c2', kind: 'upgrade', tree: 'crit', name: 'Deep Cut', desc: '+0.5× crit dmg', stat: 'critMult', perLevel: 0.5, baseCost: 60, costGrowth: 1.2, maxLevel: 40, requires: 'c1', x: 480, y: 520 }, // prettier-ignore
    { id: 'd2', kind: 'upgrade', tree: 'dmg', name: 'Heavy Hand', desc: '+20% tap', stat: 'tapMult', perLevel: 0.2, baseCost: 90, costGrowth: 1.2, maxLevel: 40, requires: 'scuff', x: 760, y: 520 }, // prettier-ignore
    { id: 'd4', kind: 'upgrade', tree: 'dmg', name: 'Crushing Blow', desc: '+6 tap dmg', stat: 'tapFlat', perLevel: 6, baseCost: 120, costGrowth: 1.2, maxLevel: 40, requires: 'scuff', x: 1240, y: 520 }, // prettier-ignore
    { id: 'k2', kind: 'upgrade', tree: 'cats', name: 'Rally', desc: '+18% cat strike', stat: 'catMult', perLevel: 0.18, baseCost: 60, costGrowth: 1.2, maxLevel: 40, requires: 'k1', x: 1520, y: 520 }, // prettier-ignore
    catNode('nona', 'scuff', 1000, 520),
    // depth 3.
    { id: 'k3', kind: 'upgrade', tree: 'cats', name: 'Pride', desc: '+35% cat strike', stat: 'catMult', perLevel: 0.35, baseCost: 260, costGrowth: 1.22, maxLevel: 40, requires: 'nona', x: 760, y: 720 }, // prettier-ignore
    { id: 'k4', kind: 'upgrade', tree: 'cats', name: 'Big Litter', desc: '+4 cat strike', stat: 'catFlat', perLevel: 4, baseCost: 300, costGrowth: 1.2, maxLevel: 40, requires: 'nona', x: 1240, y: 720 }, // prettier-ignore
    catNode('glimmer', 'nona', 1000, 720),
    // depth 4.
    { id: 'm1', kind: 'upgrade', tree: 'economy', name: 'Bright Coats', desc: '+20% light', stat: 'lightMult', perLevel: 0.2, baseCost: 400, costGrowth: 1.22, maxLevel: 16, requires: 'glimmer', x: 760, y: 920 }, // prettier-ignore
    { id: 'm2', kind: 'upgrade', tree: 'economy', name: 'Refraction', desc: '+30% light', stat: 'lightMult', perLevel: 0.3, baseCost: 500, costGrowth: 1.24, maxLevel: 16, requires: 'glimmer', x: 1240, y: 920 }, // prettier-ignore
    catNode('blink', 'glimmer', 1000, 920),
    // depth 5.
    { id: 'd3', kind: 'upgrade', tree: 'dmg', name: 'Overwhelm', desc: '−10% grey heal', stat: 'regenMult', perLevel: 0.9, baseCost: 700, costGrowth: 1.25, maxLevel: 12, requires: 'blink', x: 760, y: 1120 }, // prettier-ignore
    { id: 'e1', kind: 'upgrade', tree: 'endurance', name: 'Second Wind', desc: '+2 max stamina', stat: 'staminaFlat', perLevel: 2, baseCost: 600, costGrowth: 1.25, maxLevel: 25, requires: 'blink', x: 1240, y: 1120 }, // prettier-ignore
    catNode('comet', 'blink', 1000, 1120),
    // depth 6.
    { id: 'c3', kind: 'upgrade', tree: 'crit', name: 'Frenzy', desc: '+2% crit', stat: 'critChance', perLevel: 0.02, baseCost: 900, costGrowth: 1.25, maxLevel: 16, requires: 'comet', x: 760, y: 1320 }, // prettier-ignore
    { id: 'c4', kind: 'upgrade', tree: 'crit', name: 'Devastate', desc: '+1.5× crit dmg', stat: 'critMult', perLevel: 1.5, baseCost: 1100, costGrowth: 1.22, maxLevel: 40, requires: 'comet', x: 1240, y: 1320 }, // prettier-ignore
    catNode('tinker', 'comet', 1000, 1320),
    // depth 7.
    { id: 'o1', kind: 'upgrade', tree: 'openers', name: 'Head Start', desc: 'start +1 bay', stat: 'openerBay', perLevel: 1, baseCost: 1500, costGrowth: 1.6, maxLevel: 10, requires: 'tinker', x: 760, y: 1520 }, // prettier-ignore
    { id: 'm3', kind: 'upgrade', tree: 'economy', name: 'Spectrum', desc: '+50% light', stat: 'lightMult', perLevel: 0.5, baseCost: 1600, costGrowth: 1.25, maxLevel: 16, requires: 'tinker', x: 1240, y: 1520 }, // prettier-ignore
    { id: 'e2', kind: 'upgrade', tree: 'endurance', name: 'Deep Breath', desc: '+3 max stamina', stat: 'staminaFlat', perLevel: 3, baseCost: 1400, costGrowth: 1.25, maxLevel: 25, requires: 'tinker', x: 1000, y: 1520 }, // prettier-ignore
    // depth 8.
    { id: 'o2', kind: 'upgrade', tree: 'openers', name: 'Vanguard', desc: 'start +1 bay', stat: 'openerBay', perLevel: 1, baseCost: 2400, costGrowth: 1.7, maxLevel: 10, requires: 'o1', x: 760, y: 1720 }, // prettier-ignore
    { id: 'e3', kind: 'upgrade', tree: 'endurance', name: 'Marathon', desc: '+5 max stamina', stat: 'staminaFlat', perLevel: 5, baseCost: 2200, costGrowth: 1.25, maxLevel: 25, requires: 'e2', x: 1000, y: 1720 }, // prettier-ignore
    // Aim — the cloud-tapping branch (off the root, far-side lanes): how tap targets spawn + how easily you hit.
    { id: 'g1', kind: 'upgrade', tree: 'aim', name: 'Gathering Grey', desc: '+0.5 clouds/sec', stat: 'spawnFlat', perLevel: 0.5, baseCost: 25, costGrowth: 1.2, maxLevel: 20, requires: 'd1', x: 200, y: 320 }, // prettier-ignore
    { id: 'g3', kind: 'upgrade', tree: 'aim', name: 'Swarm', desc: '+1 max cloud', stat: 'cloudFlat', perLevel: 1, baseCost: 120, costGrowth: 1.35, maxLevel: 9, requires: 'g1', x: 200, y: 520 }, // prettier-ignore
    { id: 'g2', kind: 'upgrade', tree: 'aim', name: 'Keen Eye', desc: '+8px hit radius', stat: 'hitFlat', perLevel: 8, baseCost: 25, costGrowth: 1.2, maxLevel: 20, requires: 'd1', x: 1800, y: 320 }, // prettier-ignore
    { id: 'g4', kind: 'upgrade', tree: 'aim', name: 'Ember Hunt', desc: '+5% charged cloud', stat: 'chargedFlat', perLevel: 0.05, baseCost: 200, costGrowth: 1.25, maxLevel: 10, requires: 'g2', x: 1800, y: 520 }, // prettier-ignore
];

/** Node lookup by id, for the engine's reveal + cost checks (now includes cat nodes). */
export const NODE_BY_ID: Readonly<Record<string, TreeNode>> = Object.fromEntries(
    UPGRADE_NODES.map(node => [node.id, node])
);

/** The {@link CatDef} a location at `index` houses — a named specialist, or a generic kitten past the roster. */
export function catDefForIndex(index: number): CatDef {
    return (
        CAT_ROSTER[index] ?? {
            id: `kitten-${index}`,
            name: 'a stray kitten',
            ability: 'strike',
            blurb: 'Eager: strikes every turn',
            color: 0xc9d2dc,
        }
    );
}

const NUMBER_SUFFIXES = ['', 'k', 'm', 'b', 't', 'qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'] as const;

/**
 * Compact, sign-aware display of a (possibly huge) plain double at ~3 significant figures: `k/m/b/t` then
 * `qa/Qi/Sx/Sp/Oc/No/Dc` (1e3…1e33), then scientific (`1.23e34`) past the suffix table. Values below 1000
 * are shown as-is with up to 2 decimals trimmed. Supersedes the scene's old private `formatNum`.
 */
export function formatNumber(n: number): string {
    if (!Number.isFinite(n)) return String(n);
    if (n === 0) return '0';
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);

    // Sub-unit values: keep ~2 sig figs instead of collapsing to "0".
    if (abs < 1) return sign + trimZeros(abs.toPrecision(2)).replace(/e\+?/, 'e');

    // Pick the suffix tier, then round. Rounding can push the mantissa to 1000 (e.g. 999999 would render
    // "1000k"), so promote a tier whenever it does.
    let tier = abs < 1000 ? 0 : Math.floor(Math.log10(abs) / 3);
    let scaled = abs / 1000 ** tier;
    let fixed = sigFigs(scaled);
    if (parseFloat(fixed) >= 1000) {
        tier += 1;
        scaled = abs / 1000 ** tier;
        fixed = sigFigs(scaled);
    }
    if (tier < NUMBER_SUFFIXES.length) return sign + trimZeros(fixed) + NUMBER_SUFFIXES[tier];

    // Past the suffix table: scientific, ~3 sig figs.
    return sign + trimZeros(abs.toExponential(2)).replace(/e\+?/, 'e');
}

/** ~3 significant figures of a value in [1, 1000): <10 → 2dp, <100 → 1dp, else 0dp. */
function sigFigs(v: number): string {
    return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
}

/** Drop trailing zeros (and a dangling decimal point) from a fixed/exponential string mantissa. */
function trimZeros(s: string): string {
    if (!s.includes('.')) return s;
    const [mantissa, exp] = s.split('e');
    const trimmed = mantissa.replace(/\.?0+$/, '');
    return exp !== undefined ? `${trimmed}e${exp}` : trimmed;
}
