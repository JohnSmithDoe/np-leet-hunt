import { DungeonPlan } from '@shared/np-config';
import { NPRng } from '@shared/np-library';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonFeature } from './features/pixel-dungeon.feature';
import { StairsFeature } from './features/pixel-dungeon.stairs';
import { PixelDungeonRoom } from './parts/pixel-dungeon.room';
import { PixelDungeon } from './pixel-dungeon';

/**
 * The world-content **decorator** (RPG cluster C, step 0): a SEPARATE post-carve pass that places feature
 * entities into an already-generated dungeon. Deliberately NOT a 6th carve stage and NOT a new
 * `ETileType` — features ride the `ChessLayer.features` band over the unchanged floor, so the generator,
 * the tile types, and the autotiler are all untouched (the stated cluster-C rationale).
 *
 * **Deterministic.** It is driven by an {@link NPRng} the engine seeds from the dungeon's seed (suffixed so
 * it draws a different stream than generation but is still fully reproducible: the same seed ⇒ the same
 * decoration). The factory builds its RNG the same way (`new NPRng(seed)`), so we reuse that type verbatim.
 *
 * The decorator splits into two layers so the seed-determined *decision* is pure and headless-testable
 * (like the generation factory), while only the entity *construction* needs a live scene:
 *  - {@link planStairs} — pure: which tile the exit stairs lands on. All the step-0 guarantees live here
 *    (deterministic by seed, walkable, never the player start tile).
 *  - {@link decorate} — composes the plan with `new StairsFeature(scene)` and returns the entities.
 *
 * **Step 0 scope.** Exactly one {@link StairsFeature} (the exit), placed in the room **farthest from the
 * start** by a simple room-center distance metric. That is enough to prove the feature z-layer, the
 * `mob:entered-tile` trigger and the objective-driven exit end to end. The {@link DungeonPlan}'s
 * `trapCount`/`lockCount` are carried but not consumed yet — traps/chests/locked-doors are #14.
 *
 * Deferred to #14: a proper room-adjacency graph (reconstructed from `junction.regions`, the data the
 * factory discards) so a locked door's key can be placed *solvably*. Step 0's farthest-room metric is a
 * stand-in for that graph and intentionally simple.
 */
export class PixelDungeonDecorator {
    constructor(private readonly scene: NPSceneWithBoard) {}

    /**
     * Decorate a generated dungeon with feature entities and return them (the engine adds each to the
     * level via `level.addFeature`). The returned stairs sits on the tile chosen by the pure
     * {@link planStairs} — guaranteed walkable and never the player start tile.
     */
    decorate(dungeon: PixelDungeon, plan: DungeonPlan, rng: NPRng): PixelDungeonFeature[] {
        // `plan` is intentionally unread in step 0 — its trap/lock budgets are reserved for #14. Touch it
        // so the unused-parameter lint stays quiet and the signature documents the seam for later work.
        void plan;

        const features: PixelDungeonFeature[] = [];
        const tile = this.planStairs(dungeon, rng);
        if (tile) features.push(new StairsFeature(this.scene).place(tile.x, tile.y));
        return features;
    }

    /**
     * Pure placement decision for the exit stairs (no scene needed — this is the headless-testable core).
     * Picks a walkable tile in the room farthest from the start, never the player start tile:
     *  - "farthest" maximises room-center Euclidean distance from the start room — a cheap stand-in for
     *    true graph distance (deferred to #14);
     *  - the RNG picks which floor tile inside that room holds the stairs, so the exact tile varies
     *    deterministically by seed while always staying inside the exit room and off the start tile.
     * Returns `null` only for a degenerate dungeon (no rooms, or a single room whose only tile is the
     * start) — the engine then places no stairs rather than crashing.
     */
    planStairs(dungeon: PixelDungeon, rng: NPRng): TileXYType | null {
        const rooms = dungeon.rooms;
        if (rooms.length === 0) return null;

        const startRoom = rooms[0];
        const startTile = startRoom.bottomRight(); // matches PixelDungeonLevel.start
        const exitRoom = this.#farthestRoom(rooms, startRoom);

        // Candidate tiles: every floor tile of the exit room that isn't the player's start tile. The start
        // room is normally a different room, but guard the single-room edge case explicitly anyway.
        const candidates = exitRoom.tiles.filter(tile => !(tile.x === startTile.x && tile.y === startTile.y));
        if (candidates.length === 0) return null;

        const tile = rng.item(candidates);
        return { x: tile.x, y: tile.y };
    }

    /**
     * The room whose center is farthest (Euclidean) from the start room's center. Ties resolve to the
     * first encountered, which is deterministic given the rooms' stable insertion order. Falls back to the
     * start room only if it is the sole room (handled by the caller's start-tile exclusion).
     */
    #farthestRoom(rooms: PixelDungeonRoom[], startRoom: PixelDungeonRoom): PixelDungeonRoom {
        const start = this.#center(startRoom);
        let best = startRoom;
        let bestDistance = -1;
        for (const room of rooms) {
            if (room === startRoom) continue;
            const center = this.#center(room);
            const distance = (center.x - start.x) ** 2 + (center.y - start.y) ** 2; // squared — order-preserving
            if (distance > bestDistance) {
                bestDistance = distance;
                best = room;
            }
        }
        return best;
    }

    /** A room's center, from its sorted-corner extents (cheap and stable, no per-tile averaging). */
    #center(room: PixelDungeonRoom): TileXYType {
        const topLeft = room.topLeft();
        const bottomRight = room.bottomRight();
        return { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 };
    }
}
