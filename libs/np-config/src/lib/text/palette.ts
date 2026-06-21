/**
 * The game's colour palette — the single source of truth for every text/UI colour, named by role
 * rather than by hue so the look can be retuned in one place. Consumed by {@link TEXT} and directly
 * by scenes for dynamic per-element colours (gain/loss, urgency).
 */
export const PALETTE = {
    // System cyan family — timers, scores, captions.
    cyan: '#4dd3f6',
    cyanStroke: '#042b2c',
    // Duel outcomes (shared by scoreboard labels, the countdown urgency red, and the outro banner).
    win: '#7cfc9a',
    lose: '#f6534d',
    draw: '#9fe7ef',
    amber: '#f6c14d', // countdown mid-urgency
    inkStroke: '#02110a', // heavy dark stroke under bright duel text
    // Space-map HUD.
    hudTitle: '#e7ecff',
    hudSubtitle: '#cfd8ff',
    hudMuted: '#9fb0d0',
    hudPet: '#bfa6ff',
    alert: '#ff8a8a', // snapback / loss
    gain: '#8affc8', // resource gain / reprieve
    // Pixel-dungeon floaters.
    heal: '#00ff00',
    damage: '#ff0000',
    blocked: '#af641a',
    dodged: '#ece212',
} as const;
