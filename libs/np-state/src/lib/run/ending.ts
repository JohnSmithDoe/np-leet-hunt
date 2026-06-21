import { CREW_DISPLAY_NAMES, CrewMember, RunContext, SECTOR_COUNT } from '@shared/np-config';

/**
 * How a run ended — which exit the player took (Leet-33/34 / GDD §2 "Endings"). The conductor records
 * this the moment the run resolves, then renders the matching text ending. Bittersweet by design: per
 * GDD §3 even a partial rescue is a rescue, never a flat "game over".
 */
export type EndingKind =
    /** Beat the final guardian — the sibling is won back and the channel to the Hush opens (GDD §2 full rescue). */
    | 'rescued'
    /** The normality front caught the ship — reality snapped back mid-hunt (partial rescue stands). */
    | 'snapback'
    /** Bailed out through a rim boundary sun — escaped the Hush, this sector's captive left behind. */
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
    rescued: {
        title: 'The last gate opened',
        opening: 'You broke the final gate and won the sibling back; ahead, the grey thins around a stillness.',
        closing: "That stillness is the Hush's own quarter — and for the first time, the way in stands open.",
    },
    snapback: {
        title: 'Reality snapped back',
        opening: 'The grey caught the ship and the channel folded shut behind you.',
        closing: 'Whoever you won back is home and safe; the rest are lost in this telling.',
    },
    bail: {
        title: 'Bailed to the rim',
        opening: 'You burned for a boundary sun and slipped the Hush — this gate left unbroken behind you.',
        closing: 'Whoever you won back is home and safe; the rest are still out there in the grey.',
    },
    wiped: {
        title: 'The ship was lost',
        opening: 'The ship came apart in the dark; the hunt ended here.',
        closing: 'The robo-pet remembers. By the next telling, it tries again.',
    },
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
    return `Home safe: ${crew.map(member => CREW_DISPLAY_NAMES[member]).join(', ')}.`;
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
