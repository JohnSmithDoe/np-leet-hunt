import { EItemSlot, ItemDef, ItemMods } from '@shared/np-config';

import { PixelDungeonMob } from '../pixel-dungeon.mob';

/**
 * The 4th mob trait (Leet combat spine), sibling to `MobMovement`/`MobVision`/`MobAction`: a mob's
 * hit points and combat stats. Built in `mob.create()` and exposed via `mob.combat`, exactly like the
 * other three.
 *
 * Deliberately Phaser-free — it reads only plain numbers off `mob.options` (+ equipped {@link ItemDef}s)
 * and tracks a single `#hp` field — so it constructs against a stub mob and unit-tests headless (cf.
 * `mob-combat.spec.ts`).
 *
 * **The equipment fold (item #13).** A mob carries an equipped set ({@link equip}/{@link unequip}); the
 * `attack`/`defense`/`maxHp` getters return the **base** stat (from `mob.options`, sourced from the
 * bestiary) **plus the sum of every equipped item's matching `mods`**. So equipment changes a mob's combat
 * output WITHOUT the formula changing — `resolveDamage` keeps reading `mob.combat.attack`/`.defense`, now
 * equipment-aware. With nothing equipped the fold is a no-op (the sum is 0), so the standalone/debug path
 * (no equipment injected) keeps the exact base stats.
 */
export class MobCombat {
    #hp: number;
    // The equipped set — at most one item per slot, so a `Partial<Record>` keyed by slot (re-equipping a
    // slot replaces its occupant). The getters fold the sum of these items' mods into the base stat.
    readonly #equipped: Partial<Record<EItemSlot, ItemDef>> = {};

    constructor(private mob: PixelDungeonMob) {
        // Start at full health. `maxHp` is the *folded* cap (base + any equipped maxHp mods present at
        // construction), so a freshly-spawned mob is undamaged at its equipped maximum.
        this.#hp = this.maxHp;
    }

    /** The currently-equipped items, keyed by slot (read-only view for HUD/inspection). */
    get equipped(): Partial<Record<EItemSlot, ItemDef>> {
        return this.#equipped;
    }

    /**
     * Equip an item into its slot (item #13), replacing whatever held that slot. Only equipment — an item
     * with a {@link ItemDef.slot} — is accepted; a non-equipment item (no slot) is ignored. The stat getters
     * pick the change up immediately, so `maxHp` may rise; we deliberately do NOT refill current HP — the kid
     * gear-swaps mid-fight at whatever HP they're on (only the *cap* moves), and `heal()` is the only thing
     * that restores HP. Current HP is clamped down should an unequip lower the cap below it (see `unequip`).
     */
    equip(item: ItemDef): void {
        if (!item.slot) return;
        this.#equipped[item.slot] = item;
    }

    /** Remove whatever occupies `slot`. Clamps current HP to the (possibly lowered) `maxHp` so it can't exceed the cap. */
    unequip(slot: EItemSlot): void {
        delete this.#equipped[slot];
        this.#hp = Math.min(this.#hp, this.maxHp);
    }

    /** Sum a single stat's `mods` across every equipped item (0 with nothing equipped → the fold is a no-op). */
    #modSum(stat: keyof ItemMods): number {
        return Object.values(this.#equipped).reduce((total, item) => total + (item.mods?.[stat] ?? 0), 0);
    }

    get maxHp(): number {
        return this.mob.options.maxHp! + this.#modSum('maxHp');
    }

    get hp(): number {
        return this.#hp;
    }

    get attack(): number {
        return this.mob.options.attack! + this.#modSum('attack');
    }

    get defense(): number {
        return this.mob.options.defense! + this.#modSum('defense');
    }

    /** Health as a 0..1 fraction (HP bars / flee-below-pct AI). Guards a zero `maxHp` so it never NaNs. */
    get fraction(): number {
        return this.maxHp > 0 ? this.#hp / this.maxHp : 0;
    }

    get isDead(): boolean {
        return this.#hp <= 0;
    }

    /** Take `amount` damage, clamped so HP never drops below 0 (death is `hp <= 0`, never negative). */
    applyDamage(amount: number): void {
        this.#hp = Math.max(0, this.#hp - amount);
    }

    /** Restore `amount`, clamped to `maxHp` so a heal can't overfill. */
    heal(amount: number): void {
        this.#hp = Math.min(this.maxHp, this.#hp + amount);
    }
}
