// https://github.com/munificent/hauberk
// https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/

import {
    AllDirections,
    array2D,
    CardinalDirections,
    directionToPos,
    EDirection,
    NPRect,
    NPRng,
    NPVec2,
} from '@shared/np-library';

import { ETileType, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';

/// The random dungeon generator.
///
/// Starting with a stage of solid walls, it works like so:
///
/// 1. Place a number of randomly sized and positioned rooms. If a room
///    overlaps an existing room, it is discarded. Any remaining rooms are
///    carved out.
/// 2. Any remaining solid areas are filled in with mazes. The maze generator
///    will grow and fill in even odd-shaped areas, but will not touch any
///    rooms.
/// 3. The result of the previous two steps is a series of unconnected rooms
///    and mazes. We walk the stage and find every tile that can be a
///    "connector". This is a solid tile that is adjacent to two unconnected
///    regions.
/// 4. We randomly choose connectors and open them or place a door there until
///    all the unconnected regions have been joined. There is also a slight
///    chance to carve a connector between two already-joined regions, so that
///    the dungeon isn't single connected.
/// 5. The mazes will have a lot of dead ends. Finally, we remove those by
///    repeatedly filling in any open tile that's closed on three sides. When
///    this is done, every corridor in a maze actually leads somewhere.
/// 6. The maze has a lot of walls now. We remove those walls that are surrounded
///    only by walls
/// 7. This leads to big empty spaces "rooms?" we could use them by carving them out
/// The end result of this is a multiply-connected dungeon with rooms and lots
/// of winding corridors.

const defaultDungeon: TDungeonOptions = {
    roomArea: 75,
    height: 25,
    width: 25,
    extraConnectorChance: 20,
    roomExtraSize: 0,
    straightenPercentage: 50,
};

export class PixelDungeonFactory {
    #rng: NPRng;

    #options: TDungeonOptions;
    #dungeon: TDungeonTile[][];

    /// The index of the current region being carved.
    #currentRegion = 0;
    #bounds: NPRect;
    #rooms: NPRect[] = [];

    generate(options?: TDungeonOptions) {
        this.#initializeDungeon(options);

        this.#addRooms();
        this.#addHallways();
        this.#addJunctions();
        // return this.#dungeon;
        this.#removeDeadEnds();
        this.#removeFullWalls();
        this.#addEmptyFrame();
        return this.#dungeon;
    }

    #initializeDungeon(options: TDungeonOptions) {
        options = Object.assign({}, defaultDungeon, options ?? {});
        if (options.width % 2 === 0 || options.height % 2 === 0) {
            throw new Error('The options must be odd-sized');
            // hmm: why is that important for alignment
        }
        this.#options = options;
        this.#options.roomTries ??= options.width * options.height ?? options.width;

        this.#rng = new NPRng(this.#options.seed ?? `${Date.now()}#PixelDungeon`);
        this.#bounds = new NPRect(0, 0, options.width, options.height);
        this.#dungeon = array2D(options.height, options.width, (row, col) => ({
            type: ETileType.wall,
            region: this.#currentRegion,
            x: col,
            y: row,
        }));
    }

    #addHallways() {
        // Fill in all the empty space with mazes.
        for (let y = 1; y < this.#options.height; y += 2) {
            for (let x = 1; x < this.#options.width; x += 2) {
                const pos = new NPVec2(x, y);
                if (this.#getTileType(pos) !== ETileType.wall) continue;
                this.#growHallway(pos);
            }
        }
    }

    #addRooms() {
        /// Places rooms randomly inside the grid
        let roomArea = 0;
        let roomAreaPercentage = 0;
        // try to create rooms until roomTries runs out or the requested room area is covered
        while (--this.#options.roomTries > 0 && roomAreaPercentage < this.#options.roomArea) {
            const room = this.#createRoom();
            if (!room) continue;
            this.#rooms.push(room);
            this.#startRegion();
            for (const pos of room) {
                this.#carve(pos, ETileType.room);
            }

            // this counts the paths around a room double for some rooms
            // without no paths around would be accounted for
            roomArea += room.inflate(1).area;
            roomAreaPercentage = (roomArea / this.#bounds.inflate(-1).area) * 100;
        }
    }

    #addJunctions() {
        // Find all the tiles that can connect two (or more) regions.
        const connectorRegions: Record<string, Set<number>> = {};
        const connectorPoss: Record<string, NPVec2> = {};
        for (const pos of this.#bounds.inflate(-1)) {
            // only walls can't already be part of a region.
            if (this.#getTileType(pos) !== ETileType.wall) continue;

            const regions = new Set<number>();
            // collect cardinal regions of the wall
            CardinalDirections.forEach(dir => {
                const next = pos.add(directionToPos(dir));
                const region = this.#getRegion(next);
                if (region !== 0) regions.add(region);
            });
            // if there are two or more regions it's a possible connector
            if (regions.size < 2) continue;

            connectorRegions[pos.hashCode()] = regions;
            connectorPoss[pos.hashCode()] = pos;
        }
        let connectors = Object.values(connectorPoss);
        // Keep track of which regions have been merged. This maps an original
        // region index to the one it has been merged to.
        // all regions are not connected at the beginning
        const merged = {};
        const openRegions = new Set<number>();
        for (let i = 1; i <= this.#currentRegion; i++) {
            merged[i] = i;
            openRegions.add(i);
        }
        // Keep connecting regions until we're down to one.
        while (openRegions.size > 1) {
            const connector = this.#rng.item(connectors);
            // Carve the connection.
            this.#addJunction(connector);

            // Merge the connected regions. We'll pick one region (arbitrarily) and
            // map all other regions to its index.
            let dest;
            const sources: number[] = [];
            const mergedRegions = [];
            for (const region of connectorRegions[connector.hashCode()]) {
                mergedRegions.push(merged[region]);
            }
            for (const region of mergedRegions) {
                if (!dest) {
                    dest = region;
                } else {
                    sources.push(region);
                }
            }
            // Merge the affected regions. We have to look at *all* of the
            // regions because other regions may have previously been merged with
            // some of the ones we're merging now.
            for (let i = 0; i <= this.#currentRegion; i++) {
                if (sources.includes(merged[i])) {
                    merged[i] = dest;
                }
            }

            // The sources are no longer in use.
            sources.forEach(s => openRegions.delete(s));
            const extras = [] as NPVec2[];
            // Remove any connectors that aren't needed anymore.
            connectors = connectors.filter(other => {
                // Don't allow connectors right next to each other.
                if (connector.subtract(other).isSmallerOrEqual(1)) return false;
                // If the connector no long spans different regions, we don't need it.
                const regionsSet = new Set<number>();
                for (const region of connectorRegions[other.hashCode()].values()) {
                    regionsSet.add(merged[region]);
                }

                if (regionsSet.size > 1) return true;

                // This connecter isn't needed, but connect it occasionally so that the
                // dungeon isn't singly-connected.
                // this can lead to adjacent connections...
                // add max extra connections to prevent tooo much -> probably distribute a bit
                if (this.#rng.oneIn(this.#options.extraConnectorChance)) {
                    // check if cardinal neighbours are already added
                    const neighbours = CardinalDirections.map(dir => directionToPos(dir).add(other));
                    const isAdjacent = neighbours.reduce(
                        (adjacent, neighbour) => adjacent || !!extras.find(e => e.subtract(neighbour).equals(0)),
                        false
                    );
                    if (!isAdjacent) {
                        this.#addJunction(other);
                        extras.push(other);
                    }
                }

                return false;
            });
        }
    }

    #removeDeadEnds() {
        let done = false;
        while (!done) {
            done = true;

            for (const pos of this.#bounds.inflate(-1)) {
                if (this.#getTileType(pos) === ETileType.wall) continue;

                // If it only has one exit, it's a dead end.
                let exits = 0;
                CardinalDirections.forEach(dir => {
                    if (this.#getTileType(pos.add(directionToPos(dir))) !== ETileType.wall) exits++;
                });

                if (exits !== 1) continue;

                done = false;
                this.#setTileType(pos, ETileType.wall);
            }
        }
    }

    #removeFullWalls() {
        let done = false;
        while (!done) {
            done = true;

            for (const pos of this.#bounds) {
                if (this.#getTileType(pos) !== ETileType.wall) continue;

                // If it only has walls as neighbours it can go
                let exits = 0;
                AllDirections.forEach(dir => {
                    const neighbourPos = pos.add(directionToPos(dir));
                    if (!this.#bounds.contains(neighbourPos)) return;
                    const eTileType = this.#getTileType(neighbourPos);
                    if (eTileType !== ETileType.wall && eTileType !== ETileType.none) exits++;
                });

                if (exits !== 0) continue;

                done = false;
                this.#setTileType(pos, ETileType.none);
            }
        }
    }

    // helper

    #growHallway(start: NPVec2) {
        /// Implementation of the "growing tree" algorithm from here:
        /// http://www.astrolog.org/labyrnth/algrithm.htm.
        const cells: NPVec2[] = [];
        let lastDir;

        this.#startRegion();
        this.#carve(start);

        cells.push(start);
        while (cells.length) {
            const cell = cells.pop();

            // See which adjacent cells are open.
            const possibleCells = CardinalDirections.filter(dir => this.#canCarve(cell, dir));

            if (possibleCells.length) {
                // Based on how "straight" passages are, try to prefer carving in the
                // same direction.
                let dir: EDirection;
                if (
                    lastDir &&
                    possibleCells.includes(lastDir) &&
                    this.#rng.percentageHit(this.#options.straightenPercentage)
                ) {
                    dir = lastDir;
                } else {
                    dir = this.#rng.item(possibleCells);
                }
                const pos = directionToPos(dir);
                const nextPos = cell.add(pos);
                this.#carve(nextPos);
                const secondPos = cell.add(pos.mul(2));
                this.#carve(secondPos);
                cells.push(secondPos);
                lastDir = dir;
            } else {
                // No adjacent uncarved cells.
                cells.pop();

                // This path has ended.
                lastDir = null;
            }
        }
    }

    #createRoom() {
        // Pick a random room size. The funny math here does two things:
        // - It makes sure rooms are odd-sized to line up with maze.
        // - It avoids creating rooms that are too rectangular: too tall and
        //   narrow or too wide and flat.
        // TODO: This isn't very flexible or tunable. Do something better here. min max room size
        const size = this.#rng.inRange(1, 3 + this.#options.roomExtraSize) * 2 + 1;
        // const size = 3;
        const rectangularity = this.#rng.inRange(0, 1 + Math.trunc(size / 2)) * 2;
        let width = size;
        let height = size;
        if (this.#rng.oneIn(2)) {
            width += rectangularity;
        } else {
            height += rectangularity;
        }

        const x = this.#rng.inRange(Math.trunc((this.#bounds.width - 1 - width) / 2)) * 2 + 1; // Todo -1 on bounds width for the border is not needed in the original
        const y = this.#rng.inRange(Math.trunc((this.#bounds.height - 1 - height) / 2)) * 2 + 1;

        const room = new NPRect(x, y, width, height);
        let overlaps = false;
        for (const other of this.#rooms) {
            if (room.distanceTo(other) <= 0) {
                overlaps = true;
                break;
            }
        }
        return overlaps ? null : room;
    }

    // utils

    #canCarve(pos: NPVec2, direction: EDirection): boolean {
        /// Gets whether an opening can be carved from the given starting
        /// [Cell] at [pos] to the adjacent Cell facing [direction]. Returns `true`
        /// if the starting Cell is in bounds and the destination Cell is filled
        /// (or out of bounds).
        // Must end in bounds.
        const offsetThree = directionToPos(direction).mul(3);
        const posOffsetThree = pos.add(offsetThree);
        if (!this.#bounds.contains(posOffsetThree)) return false;

        // Destination must not be open.
        const offsetTwo = directionToPos(direction).mul(2);
        const posOffSetTwo = pos.add(offsetTwo);
        return this.#getTileType(posOffSetTwo) === ETileType.wall;
    }

    #addJunction(pos: NPVec2) {
        this.#setTileType(pos, ETileType.junction);
    }

    #startRegion() {
        this.#currentRegion++;
    }

    #carve(pos: NPVec2, type: ETileType = ETileType.floor, region?: number) {
        this.#setTileType(pos, type);
        this.#setRegion(pos, region ?? this.#currentRegion);
    }

    #getTileType(pos: NPVec2) {
        return this.#dungeon[pos.y][pos.x].type;
    }

    #setTileType(pos: NPVec2, type: ETileType) {
        this.#dungeon[pos.y][pos.x].type = type;
    }

    #setRegion(pos: NPVec2, region: number) {
        this.#dungeon[pos.y][pos.x].region = region;
    }

    #getRegion(pos: NPVec2) {
        return this.#dungeon[pos.y][pos.x].region;
    }

    // not yet

    #carveRoundRoom(room: NPRect) {
        const centerX = room.center.x;
        const centerY = room.center.y;
        const circleRadius = room.circleRadius;
        console.log(centerX, centerY, circleRadius);
        for (const pos of room) {
            this.#carve(pos, ETileType.floor);
        }
        // Draw the maximum pixel circle in the grid
        this.#fillCircle(centerX, centerY, circleRadius);
    }

    #fillCircle(centerX: number, centerY: number, radius: number, type = ETileType.room): void {
        let x = radius;
        let y = 0;
        let decisionOver2 = 1 - x; // Decision criterion divided by 2 evaluated at x=r, y=0

        while (y <= x) {
            // Draw horizontal lines in the octants where y is incremented
            for (let i = centerX - x; i <= centerX + x; i++) {
                this.#carve(new NPVec2(i, centerY - y), type); // Octant 1
                this.#carve(new NPVec2(i, centerY + y), type); // Octant 8
            }

            // Draw horizontal lines in the octants where x is incremented
            for (let i = centerX - y; i <= centerX + y; i++) {
                this.#carve(new NPVec2(i, centerY - x), type); // Octant 2
                this.#carve(new NPVec2(i, centerY + x), type); // Octant 7
            }

            y++;
            if (decisionOver2 <= 0) {
                decisionOver2 += 2 * y + 1; // Change in decision criterion for y -> y+1
            } else {
                x--;
                decisionOver2 += 2 * (y - x) + 1; // Change for y -> y+1, x -> x-1
            }
        }
    }

    #addEmptyFrame() {
        this.#dungeon = array2D(this.#options.height + 2, this.#options.width + 2, (row, col) => {
            if (row === 0 || col === 0 || row === this.#options.height + 1 || col === this.#options.width + 1) {
                return {
                    type: ETileType.none,
                    region: -1,
                    x: col,
                    y: row,
                };
            } else {
                const cur = this.#dungeon[row - 1][col - 1];
                cur.x = col;
                cur.y = row;
                return cur;
            }
        });
    }
}
