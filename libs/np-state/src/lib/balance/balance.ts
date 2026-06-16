import { Sector, SECTOR_COUNT, SECTOR_ORDER, SectorParams } from './balance.model';

/**
 * The central balancing surface — the single place to tune the game. Today it holds the per-sector
 * difficulty curve; duel and dungeon resolvers (`duelParams`, `dungeonParams`) join this class as those
 * modes gain difficulty inputs. Pure and deterministic, so it unit-tests directly (cf. run.fsm.spec.ts).
 *
 * The sector curve (1→5): bigger maps, fewer bail-exits, and a faster grey front the deeper you go
 * (GDD §4 difficulty knobs / §5 grey gradient). Brackets the old hard-coded values (12 planets, ~10 jumps).
 */
const SECTOR_CURVE: readonly SectorParams[] = [
    { planetCount: 10, exits: 5, frontSteps: 12 },
    { planetCount: 12, exits: 4, frontSteps: 11 },
    { planetCount: 14, exits: 4, frontSteps: 10 },
    { planetCount: 16, exits: 3, frontSteps: 9 },
    { planetCount: 18, exits: 3, frontSteps: 8 },
];

/** Clamp a (possibly out-of-range) sector number into 1..SECTOR_COUNT. */
const clampNumber = (sectorNumber: number): number => Math.min(SECTOR_COUNT, Math.max(1, Math.floor(sectorNumber)));

export class Balance {
    /** The generation parameters for a sector by its 1-based number (clamped to a valid sector). */
    static sectorParams(sectorNumber: number): SectorParams {
        return { ...SECTOR_CURVE[clampNumber(sectorNumber) - 1] };
    }

    /** A fully-resolved {@link Sector}: id (from {@link SECTOR_ORDER}) + 1-based number + resolved params. */
    static sector(sectorNumber: number): Sector {
        const number = clampNumber(sectorNumber);
        return { id: SECTOR_ORDER[number - 1], number, ...Balance.sectorParams(number) };
    }
}
