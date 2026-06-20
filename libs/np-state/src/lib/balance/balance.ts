import { CrewMember } from '../model/run-context';
import {
    DuelAiLevel,
    DuelAiParams,
    DuelBoardLevel,
    DuelBoardParams,
    Sector,
    SECTOR_COUNT,
    SECTOR_ORDER,
    SECTOR_RESCUE,
    SectorParams,
} from './balance.model';

/**
 * The central balancing surface — the single place to tune the game. Today it holds the per-sector
 * difficulty curve; duel and dungeon resolvers (`duelParams`, `dungeonParams`) join this class as those
 * modes gain difficulty inputs. Pure and deterministic, so it unit-tests directly (cf. run.fsm.spec.ts).
 *
 * The sector curve (1→5): bigger maps, fewer bail-exits, a faster grey front, a sparser route graph, and
 * heavier Grey Fleet traffic the deeper you go (GDD §4 difficulty knobs / §5 grey gradient). Brackets the
 * old hard-coded values (12 planets, ~10 jumps, 3 routes). `linkDegree` eases off from 4 (sector 1,
 * generously connected) to 3 — never below 2, which risks stranding the graph. `interceptChance` climbs
 * 10→30% so en-route ambushes (Leet-35) stay rare early and common near the Hush.
 */
const SECTOR_CURVE: readonly SectorParams[] = [
    { planetCount: 10, exits: 5, frontSteps: 12, linkDegree: 4, interceptChance: 10 },
    { planetCount: 12, exits: 4, frontSteps: 11, linkDegree: 3, interceptChance: 15 },
    { planetCount: 14, exits: 4, frontSteps: 10, linkDegree: 3, interceptChance: 20 },
    { planetCount: 16, exits: 3, frontSteps: 9, linkDegree: 3, interceptChance: 25 },
    { planetCount: 18, exits: 3, frontSteps: 8, linkDegree: 3, interceptChance: 30 },
];

/** Clamp a (possibly out-of-range) sector number into 1..SECTOR_COUNT. */
const clampNumber = (sectorNumber: number): number => Math.min(SECTOR_COUNT, Math.max(1, Math.floor(sectorNumber)));

/**
 * Per-difficulty duel board knobs (changer / auto-fire chance). Harder boards weave in more
 * ownership-flipping changers; `<= 0` switches an effect off (e.g. easy has no changers).
 */
const DUEL_BOARD: Record<DuelBoardLevel, DuelBoardParams> = {
    debug: { changerRate: -7, autoFireRate: -2 },
    easy: { changerRate: -1, autoFireRate: 10 },
    normal: { changerRate: 5, autoFireRate: 5 },
    hard: { changerRate: -7, autoFireRate: -2 },
    brutal: { changerRate: 15, autoFireRate: 0 },
};

/**
 * Per-level droid-AI tuning. Up the ladder the AI reacts faster, plays cleaner (less noise,
 * fewer blunders) and starts timing its shots to land lit at the buzzer. `shotCooldownMs` is
 * the same human-click floor (250ms) at every level — difficulty never lets it out-click a person.
 */
const DUEL_AI: Record<DuelAiLevel, DuelAiParams> = {
    easy: { reactionMs: 1500, shotCooldownMs: 250, scoreNoise: 6, blunderChance: 0.5, usesTiming: false },
    normal: { reactionMs: 1000, shotCooldownMs: 250, scoreNoise: 3, blunderChance: 0.25, usesTiming: false },
    hard: { reactionMs: 600, shotCooldownMs: 250, scoreNoise: 1, blunderChance: 0.1, usesTiming: true },
    brutal: { reactionMs: 250, shotCooldownMs: 250, scoreNoise: 0, blunderChance: 0, usesTiming: true },
};

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

    /** The captive freed by beating a sector's guardian (Leet-34 / GDD §5); sibling is always sector 5. */
    static rescueForSector(sectorNumber: number): CrewMember {
        return SECTOR_RESCUE[clampNumber(sectorNumber) - 1];
    }

    /** The numeric board knobs for a duel board difficulty (unknown levels fall back to `normal`). */
    static duelBoardParams(level: DuelBoardLevel): DuelBoardParams {
        return { ...(DUEL_BOARD[level] ?? DUEL_BOARD.normal) };
    }

    /** The droid-AI tuning for a difficulty level (unknown levels fall back to `normal`). */
    static duelAiParams(level: DuelAiLevel): DuelAiParams {
        return { ...(DUEL_AI[level] ?? DUEL_AI.normal) };
    }
}
