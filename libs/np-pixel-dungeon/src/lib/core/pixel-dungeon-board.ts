import Board from 'phaser3-rex-plugins/plugins/board/board/Board';
import ChessData from 'phaser3-rex-plugins/plugins/board/chess/ChessData';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMap } from '../sprites/pixel-dungeon.map';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

type NPChessTypes = PixelDungeonMob | (Phaser.Tilemaps.Tile & { rexChess?: ChessData });

export class PixelDungeonBoard extends Board<NPChessTypes> {
    #engine: PixelDungeonEngine;

    constructor(engine: PixelDungeonEngine) {
        const tilemap = engine.map.tileMap;
        const config: Board.IConfig = {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal', // hmm isometric...
                dir: '8dir',
                cellWidth: tilemap.tileWidth,
                cellHeight: tilemap.tileHeight,
                x: 0,
                y: 0,
            },
            width: tilemap.width,
            height: tilemap.height,
        };
        super(engine.scene, config);
        this.#addLayers(tilemap);
        this.#setBlocker(engine.map);
        this.#engine = engine;
    }

    #addLayers(tilemap: Phaser.Tilemaps.Tilemap) {
        tilemap.layers.forEach(layer => {
            const tileZ = layer.name;
            const layerData = layer.data;
            for (let y = 0, ycnt = layerData.length; y < ycnt; y++) {
                const layerRow = layerData[y];
                for (let x = 0, xcnt = layerRow.length; x < xcnt; x++) {
                    const tile = layerRow[x];
                    this.addChess(tile, x, y, tileZ, false);
                }
            }
        });
    }

    #setBlocker(map: PixelDungeonMap) {
        // this.#tilelayer.setCollisionByExclusion([6, 7, 8, 26, ...this.#tileset.getTileIndexes('DOOR')]);
        const openTileIdx = [6, 7, 8, 26, ...map.tileLayer.tileset.getTileIndexes('DOOR')];
        this.getAllChess().forEach(t => {
            if (t instanceof Phaser.Tilemaps.Tile) {
                t.rexChess.setBlocker(!openTileIdx.includes(t.index));
            }
        });
    }
}
