import { ItemDef } from './item.model';

/**
 * The item catalog — the single source of truth for every dungeon pickup, keyed by id. This is the
 * **extension point** for floor loot: to add a pickup, add one entry here (and, when it needs bespoke
 * art, a tileset role later — the vertical slice renders a placeholder disc so new items work without
 * touching the autotiler). The dungeon scatters these by id ({@link Balance.dungeonLoot}), carries the
 * ids out as `DungeonResult.loot`, and the app banks them: a `coin`'s {@link ItemDef.value} is summed
 * into the marble economy, anything else is granted to the run inventory.
 *
 * Kept here in np-config alongside the other declarative content (the balance curve, the text palette),
 * so the mode lib stays generic — np-pixel-dungeon imports this catalog rather than hard-coding loot.
 */
export const ITEMS: Record<string, ItemDef> = {
    /** The bread-and-butter floor pickup — one marble of the run economy each. */
    coin: { id: 'coin', kind: 'coin', label: 'Marble', value: 1 },
    /**
     * Flavour pickup proving the non-coin path end to end: a consumable that restores hit points (the
     * in-dungeon combat-spine HP). Granted to the run inventory on exit today; its `effect.heal` is read
     * by `UseItemAction` once item use lands (a later task) — the data is ready now.
     */
    medkit: { id: 'medkit', kind: 'food', label: 'Medkit', effect: { heal: 5 } },

    /**
     * The starter weapon (item #13 / equipment & combat stats). An item is *equipment* by carrying a
     * {@link ItemDef.slot}; its {@link ItemDef.mods} fold additively into the wearer's combat stats. The
     * dungeon's `MobCombat` adds `+attack` here on top of the bestiary base, so the kid hits harder while
     * it's equipped — `resolveDamage` reads the folded total, untouched. `kind: 'key'` keeps it off the
     * coin/banking path (any non-`coin` kind is granted to the inventory, not the marble economy).
     */
    rustyBlade: { id: 'rustyBlade', kind: 'key', label: 'Rusty Blade', slot: 'weapon', mods: { attack: 2 } },
    /**
     * The starter armor (item #13). Equips into the `armor` slot and folds `+defense` (soaks more of each
     * hit, down to the `minDamage` floor) AND `+maxHp` (a tougher wearer) into the combat stats. Equipping
     * raises the cap but does NOT refill current HP — see `MobCombat`. Sized modestly so the depth-scaled
     * loot curve has room to grow stronger gear later.
     */
    scrapVest: { id: 'scrapVest', kind: 'key', label: 'Scrap Vest', slot: 'armor', mods: { defense: 1, maxHp: 4 } },
};
