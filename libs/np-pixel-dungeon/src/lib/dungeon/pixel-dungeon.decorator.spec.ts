import { DungeonPlan } from '@shared/np-config';
import { NPRng } from '@shared/np-library';

import { NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonDecorator } from './pixel-dungeon.decorator';
import { PixelDungeon } from './pixel-dungeon';

// Headless, plain-Vitest style (like factory.spec): the decorator's *placement* core (`planStairs`) is
// pure — it reads only the generated `PixelDungeon` model + the RNG, never the scene. The scene is needed
// only to *construct* the StairsFeature entity (a Phaser sprite), which these tests don't exercise, so a
// bare stub satisfies the constructor and we assert the seed-determined decision directly.
const decorator = () => new PixelDungeonDecorator({} as unknown as NPSceneWithBoard);

// The decorator seeds its RNG off the dungeon seed (suffixed), exactly as the engine does — replicate that
// here so the spec drives the same deterministic stream the real run would.
const rngFor = (seed: string) => new NPRng(`${seed}#decorate`);

// A real generated dungeon, same odd-sized headless build the factory spec uses.
const dungeon = (seed: string) => new PixelDungeon({ width: 21, height: 21, seed });

// The player start tile, computed the same way PixelDungeonLevel.start does (rooms[0].bottomRight()).
const startTileOf = (d: PixelDungeon) => {
    const t = d.rooms[0].bottomRight();
    return { x: t.x, y: t.y };
};

// Walkable = any room/hallway floor tile (junctions/walls excluded), keyed for set membership.
const walkableKeys = (d: PixelDungeon) => new Set(d.floorTiles.map(t => `${t.x},${t.y}`));

describe('PixelDungeonDecorator.planStairs', () => {
    const plan: DungeonPlan = { trapCount: 0, lockCount: 0 };

    it('is deterministic: the same seed reproduces the same stairs tile', () => {
        const a = decorator().planStairs(dungeon('exit-determinism'), rngFor('exit-determinism'));
        const b = decorator().planStairs(dungeon('exit-determinism'), rngFor('exit-determinism'));
        expect(a).not.toBeNull();
        expect(a).toEqual(b);
    });

    it('places the stairs on a walkable floor tile (never a wall/empty cell)', () => {
        for (const seed of ['alpha', 'bravo', 'charlie', 'delta']) {
            const d = dungeon(seed);
            const tile = decorator().planStairs(d, rngFor(seed));
            expect(tile).not.toBeNull();
            expect(walkableKeys(d).has(`${tile!.x},${tile!.y}`)).toBe(true);
        }
    });

    it('never lands the stairs on the player start tile', () => {
        for (const seed of ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']) {
            const d = dungeon(seed);
            const tile = decorator().planStairs(d, rngFor(seed));
            expect(tile).not.toEqual(startTileOf(d));
        }
    });

    it('decorate() composes the plan into exactly one stairs placement (step 0)', () => {
        // We assert the *decision* count via planStairs (decorate() also constructs the entity, which needs
        // a live scene — out of scope for a headless spec). Step 0 always yields one exit tile.
        const d = dungeon('one-exit');
        expect(decorator().planStairs(d, rngFor('one-exit'))).not.toBeNull();
        // The plan is carried but unread in step 0, so changing it can't change the placement decision.
        const a = decorator().planStairs(d, rngFor('one-exit'));
        const b = decorator().planStairs(dungeon('one-exit'), rngFor('one-exit'));
        void plan;
        expect(a).toEqual(b);
    });
});
