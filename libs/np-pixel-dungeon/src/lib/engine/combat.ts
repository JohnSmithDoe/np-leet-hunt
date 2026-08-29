import { DungeonCombatParams } from '@shared/np-config';

/**
 * The single combat *rule* of the dungeon (Leet combat spine): how much damage an attack of `attack`
 * deals against a target of `defense`. A RULE, so it lives in the mode lib (not np-config, which holds
 * only the *numbers*) — mirroring the `ParadroidAi`-vs-`DuelAiParams` split exactly. Pure numbers in,
 * a number out: no Phaser, no mob refs, so it unit-tests trivially (cf. `combat.spec.ts`).
 *
 * `attack − defense`, floored at `params.minDamage` so a connecting hit always chips at least that much
 * however high the target's defense — a fully-armoured target can still be ground down.
 */
export const resolveDamage = (attack: number, defense: number, params: DungeonCombatParams): number =>
    Math.max(params.minDamage, attack - defense);
