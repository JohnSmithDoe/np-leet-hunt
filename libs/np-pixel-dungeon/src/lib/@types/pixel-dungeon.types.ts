export enum ETileType {
    none,
    floor,
    wall,
    room,
    junction,
}

export interface TDungeonTile {
    type: ETileType;
    // The position in the dungeon grid
    x: number;
    y: number;
    // For each open position in the dungeon, the index of the connected region that that tile is a part of.
    region: number;
}

export interface TDungeonOptions {
    width: number;
    height: number;
    roomTries?: number;
    roomArea?: number;
    /// Increasing this allows rooms to be larger.
    roomExtraSize?: number;
    /// The inverse chance of adding a connector between two regions that have
    /// already been joined. Increasing this leads to more loosely connected
    /// dungeons. (oneIn(X))
    extraConnectorChance?: number;
    straightenPercentage?: number;
    seed?: string; // random seed
}