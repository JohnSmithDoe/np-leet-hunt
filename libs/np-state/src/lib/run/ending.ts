import { SECTOR_COUNT } from '../balance/balance.model';
import { CrewMember, RunContext } from '../model/run-context';

/**
 * How a run ended — which of the three exits the player took (Leet-33 / GDD §2 "Endings"). The conductor
 * records this the moment the run resolves, then renders the matching text ending. Bittersweet by design:
 * per GDD §3 even a partial rescue is a rescue, never a flat "game over".
 */
export type EndingKind =
    /** The normality front caught the ship — reality snapped back mid-hunt (partial rescue stands). */
    | 'snapback'
    /** Bailed out through a rim boundary sun — escaped the Hush, but left empty-handed. */
    | 'bail'
    /** The ship was destroyed / the crew overwhelmed — the hunt ended in the dark. */
    | 'wiped';

/** A rendered text ending: a headline and the epilogue lines beneath it (PlaceholderConfig-shaped). */
export interface Ending {
    title: string;
    lines: string[];
}

/** Headline + opening beat + sign-off per exit; the run-state lines (progress, rescued, marbles) are shared. */
const ENDING_COPY: Record<EndingKind, { title: string; opening: string; closing: string }> = {
    snapback: {
        title: 'Reality snapped back',
        opening: 'The grey caught the ship and the channel folded shut behind you.',
        closing: 'Whoever you won back is home and safe; the rest are lost in this telling.',
    },
    bail: {
        title: 'Bailed to the rim',
        opening: 'You burned for a boundary sun and slipped the Hush — empty-handed.',
        closing: 'Safe, for now — but the family are still out there in the grey.',
    },
    wiped: {
        title: 'The ship was lost',
        opening: 'The ship came apart in the dark; the hunt ended here.',
        closing: 'The robo-pet remembers. By the next telling, it tries again.',
    },
};

/** Display names for the rescued family aboard the ship (crew is empty until rescues land in Phase 4). */
const CREW_NAMES: Record<CrewMember, string> = {
    mom: 'Mom',
    dad: 'Dad',
    grandma: 'Grandma',
    grandpa: 'Grandpa',
    sibling: 'your sibling',
};

/** Humanise a kebab-case SectorId for display ('frozen-drift' → 'Frozen Drift'). */
function sectorName(id: string): string {
    return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function rescuedLine(crew: readonly CrewMember[]): string {
    if (crew.length === 0) return 'No one won back yet — the crew bays stand empty.';
    return `Home safe: ${crew.map(member => CREW_NAMES[member]).join(', ')}.`;
}

/**
 * The text ending for a finished run (Leet-33). Pure: maps the exit taken plus the carried run state
 * (sector reached, rescued crew, marbles) to a headline and epilogue, so the conductor only has to render
 * it into a placeholder screen — no Phaser, no Angular here.
 */
export function describeEnding(kind: EndingKind, ctx: RunContext): Ending {
    const copy = ENDING_COPY[kind];
    return {
        title: copy.title,
        lines: [
            copy.opening,
            `Reached sector ${ctx.sectorNumber} of ${SECTOR_COUNT} — ${sectorName(ctx.sector)}.`,
            rescuedLine(ctx.crew),
            `Marbles gathered: ${ctx.resources.marbles}.`,
            copy.closing,
        ],
    };
}
