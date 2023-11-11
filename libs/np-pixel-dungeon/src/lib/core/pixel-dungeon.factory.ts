// https://github.com/munificent/hauberk
// https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/

import { AllDirections, CardinalDirections, directionToPos, EDirection, NPRect, NPRng, Pos } from '@shared/np-library';

export enum ETileType {
    none,
    floor,
    wall,
    opendoor,
    closeddoor,
    room,
}

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
///    all of the unconnected regions have been joined. There is also a slight
///    chance to carve a connector between two already-joined regions, so that
///    the dungeon isn't single connected.
/// 5. The mazes will have a lot of dead ends. Finally, we remove those by
///    repeatedly filling in any open tile that's closed on three sides. When
///    this is done, every corridor in a maze actually leads somewhere.
///
/// The end result of this is a multiply-connected dungeon with rooms and lots
/// of winding corridors.

type Callback<T> = (col: number, row: number) => T;

interface TDungeonTile {
    type: ETileType;
    region: number;
}
interface TDungeon {
    width: number;
    height: number;
    roomTries?: number;
}

export class PixelDungeonFactory {
    /// The inverse chance of adding a connector between two regions that have
    /// already been joined. Increasing this leads to more loosely connected
    /// dungeons.
    #extraConnectorChance = 20;

    /// Increasing this allows rooms to be larger.
    #roomExtraSize = 0;

    #windingPercent = 0;
    #dungeon: TDungeonTile[][];

    #rooms: NPRect[] = [];

    /// For each open position in the dungeon, the index of the connected region
    /// that that position is a part of.
    #regions: number[][];
    #bounds: NPRect;
    /// The index of the current region being carved.
    #currentRegion = 0;
    #options: TDungeon;
    readonly #rng = new NPRng(`${Date.now()}#`);
    // readonly #rng = new NPRandom(`Leto`);

    array2D<T>(width: number, height: number, value?: T, callback?: Callback<T>) {
        const result: T[][] = [];
        for (let i = 0; i <= height; i++) {
            const row: T[] = [];
            for (let j = 0; j <= width; j++) {
                row.push(value ?? callback(i, j) ?? undefined);
            }
            result.push(row);
        }
        return result;
    }

    generate(options: TDungeon) {
        if (options.width % 2 === 0 || options.height % 2 === 0) {
            throw new Error('The options must be odd-sized');
        }
        this.#options = options;
        this.#options.roomTries ??= Math.sqrt(options.width * options.height ?? options.width) * 2;
        this.#bounds = new NPRect(0, 0, options.width, options.height);
        this.#dungeon = this.array2D(options.width, options.height, undefined, () => ({
            type: ETileType.wall,
            region: this.#currentRegion,
        }));
        this.#regions = this.array2D(options.width, options.height, 0);
        this.#addRooms();
        console.log(this.#regions, this.#rooms);
        // Fill in all the empty space with mazes.
        for (let y = 1; y < this.#options.height; y += 2) {
            for (let x = 1; x < this.#options.width; x += 2) {
                const pos = new Pos(x, y);
                if (this.#getTileType(pos) !== ETileType.wall) continue;
                this.#growMaze(pos);
            }
        }
        console.log(this.#dungeon.map(row => row.map(t => t.type)));
        console.log(this.#regions);
        this.#connectRegions();
        this.#removeDeadEnds();
        this.#removeFullWalls();
        return this.#dungeon;

        this.#rooms.forEach(this.#onDecorateRoom);
        console.log(this, this.#dungeon, this.#bounds, this.#regions, this.#rooms);
    }

    #getTileType(pos: Pos) {
        return this.#dungeon[pos.y][pos.x].type;
    }

    #setTileType(pos: Pos, type: ETileType) {
        this.#dungeon[pos.y][pos.x].type = type;
    }

    /// Randomly turns some [wall] tiles into [floor] and vice versa.
    // erode(iterations: number, floor = ETileType.floor, wall = ETileType.wall) {
    // const bounds = this.stage.bounds.inflate(-1);
    // for (let i = 0; i < iterations; i++) {
    //     // TODO: This way this works is super inefficient. Would be better to
    //     // keep track of the floor tiles near open ones and choose from them.
    //     let pos = this.#rng.vecInRect(bounds);
    //
    //     let here = this.#getTileType(pos);
    //     if (here != wall) continue;
    //
    //     // Keep track of how many floors we're adjacent too. We will only erode
    //     // if we are directly next to a floor.
    //     let floors = 0;
    //
    //     for (let dir in Direction.ALL) {
    //         let tile = this.#getTileType(pos + dir);
    //         if (tile == floor) floors++;
    //     }
    //
    //     // Prefer to erode tiles near more floor tiles so the erosion isn't too
    //     // spiky.
    //     if (floors < 2) continue;
    //     if (this.#rng.oneIn(9 - floors)) this.#setTileType(pos, floor);
    // }
    // }

    #onDecorateRoom(room: NPRect) {
        console.log('83:#onDecorateRoom', room);
    }

    /// Implementation of the "growing tree" algorithm from here:
    /// http://www.astrolog.org/labyrnth/algrithm.htm.
    #growMaze(start: Pos) {
        const cells: Pos[] = [];
        let lastDir;

        this.#startRegion();
        this.#carve(start);

        cells.push(start);
        while (cells.length) {
            if (cells.length > 100) throw new Error('dddd');
            const cell = cells.pop();

            // See which adjacent cells are open.
            const unmadeCells: EDirection[] = [];

            CardinalDirections.forEach(dir => {
                if (this.#canCarve(cell, dir)) unmadeCells.push(dir);
            });

            if (unmadeCells.length) {
                // Based on how "windy" passages are, try to prefer carving in the
                // same direction.
                let dir: EDirection;
                if (lastDir && unmadeCells.includes(lastDir) && this.#rng.range(100) > this.#windingPercent) {
                    dir = lastDir;
                } else {
                    dir = this.#rng.item(unmadeCells);
                }
                const pos = directionToPos(dir);
                this.#carve(cell.add(pos));
                this.#carve(cell.add(pos.mul(2)));

                cells.push(cell.add(pos.mul(2)));
                lastDir = dir;
            } else {
                // No adjacent uncarved cells.
                cells.pop();

                // This path has ended.
                lastDir = null;
            }
        }
    }

    /// Places rooms ignoring the existing maze corridors.
    #addRooms() {
        for (let i = 0; i < this.#options.roomTries; i++) {
            // Pick a random room size. The funny math here does two things:
            // - It makes sure rooms are odd-sized to line up with maze.
            // - It avoids creating rooms that are too rectangular: too tall and
            //   narrow or too wide and flat.
            // TODO: This isn't very flexible or tunable. Do something better here. min max room size
            const size = this.#rng.range(1, 3 + this.#roomExtraSize) * 2 + 1;
            const rectangularity = this.#rng.range(0, 1 + Math.trunc(size / 2)) * 2;
            let width = size;
            let height = size;
            if (this.#rng.oneIn(2)) {
                width += rectangularity;
            } else {
                height += rectangularity;
            }

            const x = this.#rng.range(Math.trunc((this.#bounds.width - 1 - width) / 2)) * 2 + 1; // Todo -1 on bounds width for the border is not needed in the original
            const y = this.#rng.range(Math.trunc((this.#bounds.height - 1 - height) / 2)) * 2 + 1;

            const room = new NPRect(x, y, width, height);

            let overlaps = false;
            for (const other of this.#rooms) {
                if (room.distanceTo(other) <= 0) {
                    overlaps = true;
                    break;
                }
            }

            if (overlaps) continue;

            this.#rooms.push(room);

            this.#startRegion();
            const roomRect = new NPRect(x, y, width, height);
            for (const pos of roomRect) {
                this.#carve(pos, ETileType.room);
            }
            console.log(this.#regions);
        }
    }

    #connectRegions() {
        // Find all of the tiles that can connect two (or more) regions.
        const connectorRegions: Record<string, Set<number>> = {};
        const connectorPoss: Record<string, Pos> = {};
        for (const pos of this.#bounds.inflate(-1)) {
            // only walls can't already be part of a region.
            if (this.#getTileType(pos) !== ETileType.wall) continue;

            const regions = new Set<number>();
            // collect cardinal regions of the wall
            CardinalDirections.forEach(dir => {
                const next = pos.add(directionToPos(dir));
                const region = this.#regions[next.y][next.x];
                if (region !== 0) regions.add(region);
            });
            // if there are two or more regions its a possible connector
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
            // map all of the other regions to its index.
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
            // Merge all of the affected regions. We have to look at *all* of the
            // regions because other regions may have previously been merged with
            // some of the ones we're merging now.
            for (let i = 0; i <= this.#currentRegion; i++) {
                if (sources.includes(merged[i])) {
                    merged[i] = dest;
                }
            }

            // The sources are no longer in use.
            sources.forEach(s => openRegions.delete(s));
            const extras = [] as Pos[];
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
                if (this.#rng.oneIn(this.#extraConnectorChance)) {
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

    #addJunction(pos: Pos, force = false) {
        if (this.#rng.oneIn(4)) {
            this.#setTileType(pos, this.#rng.oneIn(3) ? ETileType.opendoor : ETileType.floor);
        } else {
            this.#setTileType(pos, ETileType.closeddoor);
        }
        this.#setTileType(pos, ETileType.closeddoor);
        if (force) this.#setTileType(pos, ETileType.opendoor);
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
                    const neighbour = pos.add(directionToPos(dir));
                    if (!this.#bounds.contains(neighbour)) return;
                    const eTileType = this.#getTileType(neighbour);
                    if (eTileType !== ETileType.wall && eTileType !== ETileType.none) exits++;
                });

                if (exits !== 0) continue;

                done = false;
                this.#setTileType(pos, ETileType.none);
            }
        }
    }

    /// Gets whether or not an opening can be carved from the given starting
    /// [Cell] at [pos] to the adjacent Cell facing [direction]. Returns `true`
    /// if the starting Cell is in bounds and the destination Cell is filled
    /// (or out of bounds).</returns>
    #canCarve(pos: Pos, direction: EDirection): boolean {
        // Must end in bounds.
        const offsetThree = directionToPos(direction).mul(3);
        const posOffsetThree = pos.add(offsetThree);
        if (!this.#bounds.contains(posOffsetThree)) return false;

        // Destination must not be open.
        const offsetTwo = directionToPos(direction).mul(2);
        const posOffSetTwo = pos.add(offsetTwo);
        return this.#getTileType(posOffSetTwo) === ETileType.wall;
    }

    #startRegion() {
        this.#currentRegion++;
    }

    #carve(pos: Pos, type: ETileType = ETileType.floor, reg = true) {
        this.#setTileType(pos, type);
        if (reg) this.#dungeon[pos.y][pos.x].region = this.#currentRegion;
        if (reg) this.#regions[pos.y][pos.x] = this.#currentRegion;
    }
}
