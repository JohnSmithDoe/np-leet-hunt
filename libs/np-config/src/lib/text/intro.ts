/**
 * The one-time opening crawl shown before the hangar — a Star-Wars-style block of text that recedes into
 * the distance (rendered by the app's `np-intro-crawl` component and scored with the `intro.crawl` mood).
 * Pure content, kept here with the rest of the game's declarative copy so all text lives in one place.
 * Condensed from the GDD §2 premise.
 */
export interface IntroCrawl {
    /** A short line that fades in and out before the crawl begins (the "A long time ago…" beat). */
    opening: string;
    /** The episode/subtitle line above the title. */
    episode: string;
    /** The big title at the head of the crawl. */
    title: string;
    /** The crawl paragraphs, scrolled up into the distance in order. */
    paragraphs: readonly string[];
}

export const INTRO_CRAWL: IntroCrawl = {
    opening: 'Reality is bent. Everything is possible — and it is closing in.',
    episode: 'THE GREY TIDE',
    title: 'LEET HUNT',
    paragraphs: [
        'A grey veil washed over an ordinary house — a tide of pure ordinariness that drained colour, play, time, and memory, and dragged a whole family out into the dark.',
        'Only the KID was spared. Caught mid-play — the one thing the grey cannot take — the kid and a loyal robo-pet are the last colour left in a silent, greyed world.',
        'Where play meets the grey, reality refracts: the garage warps into a hangar, a toy ship becomes real, and a bright channel of distorted space tears open along the heading the tide took.',
        'Now the kid guns the ship up that channel after them — five sectors deep, toward the source of the grey — while the HUSH seeps in behind, closing the wound one layer at a time.',
        'What the grey takes through play can be won back through play. The hunt is on.',
    ],
};
