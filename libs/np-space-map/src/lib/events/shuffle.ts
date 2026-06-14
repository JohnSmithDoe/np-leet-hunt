/**
 * Fisher–Yates shuffle into a new array. Event answers are authored in good|neutral|bad order (the
 * internal tone, event-system.md §4) but must be *displayed* in random order so the player can't learn
 * that the good choice is always first.
 */
export const shuffled = <T>(items: readonly T[]): T[] => {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};
