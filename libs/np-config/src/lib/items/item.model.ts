import { ResourceDelta } from '../model/resources';

/**
 * What kind of thing a floor pickup is. Drives how the app banks it on return (a `coin` adds to the
 * marble economy; everything else is granted as an inventory item) and, later, how it's used in-dungeon.
 * A closed string union — the np-state idiom — so every catalog entry and every consumer speaks the
 * same vocabulary. Extend by adding a member here and an {@link ItemDef} to {@link ITEMS}.
 */
export type EItemKind = 'coin' | 'potion' | 'scroll' | 'key' | 'food';

/**
 * Which body slot a piece of equipment occupies (Leet equipment & combat stats / item #13). One item per
 * slot at a time, so the dungeon's equipped set is a `Partial<Record<EItemSlot, ItemDef>>`. A closed string
 * union — the np-state idiom (cf. {@link EItemKind}, `DuelAiLevel`) — so every consumer speaks the same
 * vocabulary. Only equipment carries a {@link ItemDef.slot}; a coin/potion/key leaves it (and `mods`) unset.
 */
export type EItemSlot = 'weapon' | 'armor' | 'trinket';

/**
 * The flat combat-stat modifiers a piece of equipment grants (item #13). Each is **signed and additive** —
 * the dungeon's `MobCombat` folds the sum of the equipped items' mods *into* the base stat read from the
 * bestiary, so `resolveDamage(attack, defense, …)` reads the folded total without the formula changing. All
 * fields optional: a weapon may carry only `+attack`, armor `+defense` and `+maxHp`, etc. Plain numbers, so
 * np-config stays free of any mode/engine type — the mode lib reads these the way it reads {@link ItemEffect}.
 */
export interface ItemMods {
    /** Added to the wearer's base attack (the `attack` side of `resolveDamage`). */
    attack?: number;
    /** Added to the wearer's base defense (the `defense` side — soaks more damage). */
    defense?: number;
    /** Added to the wearer's maximum hit points. (Equipping does NOT refill current HP — see `MobCombat`.) */
    maxHp?: number;
}

/**
 * The effect an item has when consumed. Deliberately *primitive* — only resource-meter deltas and a raw
 * heal number — so np-config (and np-state) stay free of any mode/engine type. The dungeon mode reads
 * these plain numbers; it never imports an engine class through here.
 *
 * `heal` is a hit-point restore for the in-dungeon combat spine (`mob.combat.heal`), distinct from the
 * `heart` resource meter — a potion can mend HP without touching the run's morale meter, and vice versa.
 * Both fields are optional: an item may shift resources, heal HP, or (a coin) do neither.
 */
export interface ItemEffect {
    /** Signed changes to the run's resource meters (hull / heart / marbles). Banked via `adjustResources`. */
    resources?: ResourceDelta;
    /** Hit points restored to the user (the in-dungeon `mob.combat` HP, not the `heart` meter). */
    heal?: number;
}

/**
 * One entry in the item catalog ({@link ITEMS}) — the single declarative description of a pickup. Pure
 * data: an id, what kind it is, a display label, and (optionally) a coin value and/or a usable effect.
 *
 * The split between `value` and `effect` is deliberate: a `coin` is banked straight into the marble
 * economy by its `value` (no `effect` needed — the app sums coin values into one `adjustResources`
 * call), while a usable item carries an {@link ItemEffect} the dungeon applies on use. Keeping items as
 * flat data here is what lets the dungeon mode stay generic and np-state stay free of mode types.
 */
export interface ItemDef {
    /** Stable catalog key — also the id carried in `DungeonResult.loot` and granted to the run inventory. */
    id: string;
    /** What kind of pickup this is (drives banking + future in-dungeon use). */
    kind: EItemKind;
    /** Human-readable name — shown on the pickup floater. */
    label: string;
    /** For a `coin`: how many marbles it's worth when banked on the run. Ignored for other kinds. */
    value?: number;
    /** The effect when consumed (potions / food). Absent for a passive pickup like a coin or key. */
    effect?: ItemEffect;
    /**
     * Which slot this item equips into (item #13). Its **presence is what makes an item equipment** — the
     * dungeon equips by-slot and folds its {@link mods} into the wearer's combat stats. Non-equipment items
     * (coin / potion / key / food) omit it (and {@link mods}).
     */
    slot?: EItemSlot;
    /**
     * The combat-stat modifiers this equipment grants while worn (item #13). Folded additively into the
     * wearer's base stats by `MobCombat`, so equipment changes damage without `resolveDamage` changing.
     * Present only alongside {@link slot}; omitted for non-equipment.
     */
    mods?: ItemMods;
}
