import Board from 'phaser4-rex-plugins/plugins/board/board/Board';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { ChessLayer, ChessLayerValue } from '../@types/pixel-dungeon.types';
import { PixelDungeonFeature } from '../dungeon/features/pixel-dungeon.feature';
import { PixelDungeonTile } from '../dungeon/parts/pixel-dungeon.tile';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonItem } from '../sprites/pixel-dungeon.item';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

type NPChessTypes = PixelDungeonMob | PixelDungeonTile | PixelDungeonItem | PixelDungeonFeature;

export interface TPixelDungeonBoardOptions {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
}

export class PixelDungeonBoard extends Board<NPChessTypes> {
    constructor(engine: PixelDungeonEngine, options: TPixelDungeonBoardOptions) {
        const config: Board.IConfig = {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal', // hmm isometric...
                dir: '8dir',
                cellWidth: options.tileWidth,
                cellHeight: options.tileHeight,
                x: 0,
                y: 0,
            },
            width: options.width,
            height: options.height,
        };
        super(engine.scene, config);
    }

    /**
     * The honest, band-keyed tile lookup: returns the chess registered on `layer` at `tileXY`,
     * guarded to a `PixelDungeonTile` (the part objects placed on the board). The previous public
     * `getTile` claimed to be general but only ever read the `objects` band, so it silently never
     * returned walls — these explicit getters make the band part of the call.
     */
    #tileAt(tileXY: TileXYType, layer: ChessLayerValue): PixelDungeonTile | null {
        const res = this.tileXYZToChess(tileXY.x, tileXY.y, layer);
        return res instanceof PixelDungeonTile ? res : null;
    }

    /** The door / junction under a tile (z = `objects`) — this is what the old `getTile` actually did. */
    getObjectAt(tileXY: TileXYType): PixelDungeonTile | null {
        return this.#tileAt(tileXY, ChessLayer.objects);
    }

    /**
     * Dropped loot / chest / key under a tile (z = `items`). Unlike the door/feature getters this band
     * holds {@link PixelDungeonItem} sprites (not `PixelDungeonTile` part objects), so it's guarded to
     * that type — a stray chess of any other kind reads as "no item here".
     */
    getItemAt(tileXY: TileXYType): PixelDungeonItem | null {
        const res = this.tileXYZToChess(tileXY.x, tileXY.y, ChessLayer.items);
        return res instanceof PixelDungeonItem ? res : null;
    }

    /**
     * Trap / stairs under a tile (z = `features`, RPG cluster C). Like the `items` band this holds
     * {@link PixelDungeonFeature} entities (not `PixelDungeonTile` part objects), so it's guarded to that
     * type — a stray chess of any other kind reads as "no feature here".
     */
    getFeatureAt(tileXY: TileXYType): PixelDungeonFeature | null {
        const res = this.tileXYZToChess(tileXY.x, tileXY.y, ChessLayer.features);
        return res instanceof PixelDungeonFeature ? res : null;
    }
}
