import { ItemDef } from '@shared/np-config';

import { PixelDungeonItem } from '../../sprites/pixel-dungeon.item';
import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PickUpAction } from './handle-action.state';

// Headless stubs in the plain-Vitest style of the other specs (combat / events): the PickUpAction logic
// reads only `mob.tile` and `mob.engine.{level.getItemAt, collectItem}`, so a live board/scene isn't
// needed — we stand those in and assert the verb's "take what's here" contract.
const coin: ItemDef = { id: 'coin', kind: 'coin', label: 'Marble', value: 1 };
const fakeItem = { def: coin } as unknown as PixelDungeonItem;

const stubMob = (itemAtTile: PixelDungeonItem | null) => {
    const collectItem = vi.fn();
    const getItemAt = vi.fn().mockReturnValue(itemAtTile);
    const mob = {
        tile: { x: 5, y: 7 },
        engine: { level: { getItemAt }, collectItem } as unknown as PixelDungeonEngine,
    } as unknown as PixelDungeonMob;
    return { mob, collectItem, getItemAt };
};

describe('PickUpAction', () => {
    it('collects the item on the mob tile and completes instantly', () => {
        const { mob, collectItem, getItemAt } = stubMob(fakeItem);
        const action = new PickUpAction(mob);

        const done = action.perform();

        expect(getItemAt).toHaveBeenCalledWith(mob.tile);
        expect(collectItem).toHaveBeenCalledWith(mob, fakeItem);
        expect(done).toBe(true); // instant verb — the mob can act again the same pump
    });

    it('is a harmless no-op (still completing) when the tile is bare', () => {
        const { mob, collectItem } = stubMob(null);
        const action = new PickUpAction(mob);

        const done = action.perform();

        expect(collectItem).not.toHaveBeenCalled();
        expect(done).toBe(true); // never stalls the scheduler, even with nothing to pick up
    });
});
