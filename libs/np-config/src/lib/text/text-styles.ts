import type * as Phaser from 'phaser';

import { PALETTE } from './palette';

export type NPTextStyle = Phaser.Types.GameObjects.Text.TextStyle;

const HUD_FONT = 'sans-serif';

/**
 * Shared "look" for the duel's stroked, bold labels (scoreboard YOU / DROID). Colour and size vary per
 * call — spread this and add `color` + `fontSize`: `{ ...DUEL_LABEL_BASE, color, fontSize }`.
 */
export const DUEL_LABEL_BASE: NPTextStyle = { stroke: PALETTE.inkStroke, strokeThickness: 3, fontStyle: 'bold' };

/** Shared look for the cyan duel readouts (the countdown caption). Add `fontSize` per call. */
export const DUEL_READOUT_BASE: NPTextStyle = { color: PALETTE.cyan, stroke: PALETTE.cyanStroke, strokeThickness: 3 };

/** The semantic roles a piece of text can play. */
export type TextRole =
    | 'duelBannerWin'
    | 'duelBannerLose'
    | 'duelBannerDraw'
    | 'duelScore'
    | 'hudTitle'
    | 'hudSubtitle'
    | 'hudReadout'
    | 'hudPet'
    | 'hudBanner'
    | 'hudFloater';

const duelBanner = (color: string): NPTextStyle => ({
    fontSize: '88px',
    color,
    stroke: PALETTE.inkStroke,
    strokeThickness: 8,
    fontStyle: 'bold',
});

/**
 * The text-style registry — the single source of truth for fixed-size text looks. Pass an entry straight
 * into np-phaser's text helpers, e.g. `centeredText(scene, x, y, 'WINNER', TEXT.duelBannerWin)`. Roles
 * whose size is computed from the board (countdown digit, scoreboard label) build off the `*_BASE`
 * fragments above instead.
 */
export const TEXT: Record<TextRole, NPTextStyle> = {
    duelBannerWin: duelBanner(PALETTE.win),
    duelBannerLose: duelBanner(PALETTE.lose),
    duelBannerDraw: duelBanner(PALETTE.draw),
    duelScore: { fontSize: '52px', color: PALETTE.cyan, stroke: PALETTE.cyanStroke, strokeThickness: 4 },
    hudTitle: { fontFamily: HUD_FONT, fontSize: '24px', color: PALETTE.hudTitle },
    hudSubtitle: { fontFamily: HUD_FONT, fontSize: '22px', color: PALETTE.hudSubtitle },
    hudReadout: { fontFamily: HUD_FONT, fontSize: '20px', color: PALETTE.hudMuted },
    hudPet: { fontFamily: HUD_FONT, fontSize: '20px', color: PALETTE.hudPet },
    hudBanner: { fontFamily: HUD_FONT, fontSize: '64px', color: PALETTE.alert },
    hudFloater: { fontFamily: HUD_FONT, fontSize: '22px', fontStyle: 'bold' }, // colour set per-floater (gain/loss)
};
