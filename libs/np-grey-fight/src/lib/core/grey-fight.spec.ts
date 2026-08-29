import { GreyFight } from './grey-fight';
import { formatNumber, GreyFightTuning, UPGRADE_NODES } from './grey-fight.model';

/** Deterministic rng that never crits. */
const noCrit = () => 0.99;
/** Deterministic rng that always crits (when chance > 0). */
const alwaysCrit = () => 0;

/** A game with enough reach that one round frees the first frontier cat, for the freeing test. */
const reacher = (rng = noCrit) =>
    new GreyFight({ tapBase: 100, baseStamina: 8, baseHp: 1_000_000, catThresholdBase: 250 }, rng);

/**
 * Config for the per-cat-ability tests: an unclearable bay (so the fight never advances and round damage just
 * banks toward thresholds) with tiny, fast-growing cat thresholds so each named specialist is freed quickly
 * and deterministically. tapBase is small relative to the wall so a turn dents but never clears.
 */
const ABILITY_CFG = {
    tapBase: 50,
    catStrike: 10,
    baseHp: 1e15,
    baseStamina: 200,
    baseRegen: 4,
    catThresholdBase: 100,
    catThresholdGrowth: 3,
} as const;

/**
 * Free the first `count` named specialists (Scuff, Nona, Glimmer, …) by banking round damage past their
 * thresholds, then leave the engine sitting on the next contested frontier mid-round. Deterministic.
 */
function freeFirstCats(game: GreyFight, count: number): void {
    game.startRound();
    for (let i = 0; i < 5000 && game.snapshot().cats.length - 1 < count; i++) {
        if (game.isRoundOver) game.startRound();
        game.takeTurn();
    }
    game.drainEvents();
    if (game.snapshot().cats.length - 1 < count) throw new Error(`failed to free ${count} cats`);
}

/** Roster index of a named specialist (Scuff=0, Nona=1, …) — how many earlier cats to free first. */
const CAT_INDEX: Record<string, number> = { scuff: 0, nona: 1, glimmer: 2, blink: 3, comet: 4, tinker: 5 };

/** A fresh ability-test game with the named specialist (and everyone before it) freed and a round started. */
function gameWith(catId: keyof typeof CAT_INDEX, extra: Partial<GreyFightTuning> = {}): GreyFight {
    const game = new GreyFight({ ...ABILITY_CFG, ...extra }, noCrit);
    freeFirstCats(game, CAT_INDEX[catId] + 1);
    game.startRound();
    return game;
}

describe('GreyFight — start state', () => {
    it('owns the robo-cat, opens with location 0 contested, and the round is not yet started', () => {
        const s = new GreyFight().snapshot();
        expect(s.cats).toHaveLength(1);
        expect(s.cats[0].id).toBe('robo-cat');
        expect(s.activeLocationIndex).toBe(0);
        expect(s.activePhase).toBe('contested');
        expect(s.locations).toHaveLength(1);
        expect(s.locations[0].phase).toBe('contested');
        expect(s.locations[0].catId).toBe('scuff');
        expect(s.bay).toBe(0);
        expect(s.phase).toBe('bay');
        expect(s.light).toBe(0);
        expect(s.isRoundOver).toBe(true); // no round started yet → stamina 0
        expect(s.stamina).toBe(0);
        expect(s.nextCatName).toBe('Scuff');
    });
});

describe('GreyFight — combat turn', () => {
    it('you + cats strike, the grey regenerates, and light + roundDamage bank as stamina drops', () => {
        const game = new GreyFight({ baseHp: 1_000_000 }, noCrit); // unclearable bay → clean turn study
        game.startRound();
        game.takeTurn(); // dent the grey first so the next turn's regen has room to heal
        const before = game.snapshot();
        const expectedDealt = before.tapDamage + before.catStrike;

        const res = game.takeTurn();

        expect(res.kind).toBe('combat');
        if (res.kind !== 'combat') throw new Error('expected combat');
        expect(res.crit).toBe(false);
        expect(res.tapDamage).toBeCloseTo(before.tapDamage);
        expect(res.catStrike).toBeCloseTo(before.catStrike);
        expect(res.regen).toBeCloseTo(before.regenPerTurn);

        const after = game.snapshot();
        expect(after.stamina).toBe(before.stamina - 1);
        expect(after.roundDamage).toBeCloseTo(before.roundDamage + expectedDealt);
        expect(after.light).toBeGreaterThan(before.light);
        // grey healed regen then lost (you+cats) → net dent of (dealt − regen).
        expect(before.greyHp - after.greyHp).toBeCloseTo(expectedDealt - before.regenPerTurn);
        // the reported `damage` field is the net dent (you + cats − the heal), not gross output.
        expect(res.damage).toBeCloseTo(expectedDealt - before.regenPerTurn);
    });

    it('crit: a lucky roll multiplies the strike by critMult', () => {
        const game = new GreyFight({ baseHp: 1_000_000, lightPerDamage: 1e6 }, alwaysCrit);
        game.startRound();
        game.takeTurn(); // bank light (crit chance still 0 → no crit yet)
        expect(game.buy('d1')).toBe(true); // root — reveals c1 (Lucky Strike)
        expect(game.buy('c1')).toBe(true); // +crit chance
        const s = game.snapshot();
        expect(s.critChance).toBeGreaterThan(0);

        const res = game.takeTurn();
        if (res.kind !== 'combat') throw new Error('expected combat');
        expect(res.crit).toBe(true);
        expect(res.tapDamage).toBeCloseTo(s.tapDamage * s.critMult);
    });

    it('clearing the bay condenses the boss (bigger mass) and emits enteredBoss', () => {
        const game = new GreyFight({ baseStamina: 200 }, noCrit);
        game.startRound();
        const bayMax = game.snapshot().greyMax;
        let saw = false;
        for (let i = 0; i < 200 && !game.isRoundOver; i++) {
            game.takeTurn();
            if (game.drainEvents().some(e => e.kind === 'enteredBoss')) {
                saw = true;
                break;
            }
        }
        expect(saw).toBe(true);
        const s = game.snapshot();
        expect(s.phase).toBe('boss');
        expect(s.greyMax).toBeGreaterThan(bayMax);
    });
});

describe('GreyFight — rounds', () => {
    it('the round ends at 0 stamina (takeTurn becomes a no-op) and emits roundOver', () => {
        const game = new GreyFight({ baseStamina: 3, baseHp: 1_000_000 });
        game.startRound();
        expect(game.stamina).toBe(3);
        game.takeTurn();
        game.takeTurn();
        const last = game.takeTurn();
        expect(last.kind).toBe('combat');
        expect(game.isRoundOver).toBe(true);
        expect(game.drainEvents().some(e => e.kind === 'roundOver')).toBe(true);

        const noop = game.takeTurn();
        expect(noop.kind).toBe('none');
    });

    it('startRound refills stamina and resets the fight but keeps the meta', () => {
        const game = new GreyFight({ baseStamina: 5, baseHp: 1_000_000, lightPerDamage: 1e6 }, noCrit);
        game.startRound();
        while (!game.isRoundOver) game.takeTurn();
        game.buy('d1'); // spend some banked light → a meta change that must persist
        const lightBefore = game.snapshot().light;
        const dmgBefore = game.snapshot().tapDamage;

        game.startRound();
        const s = game.snapshot();
        expect(s.stamina).toBe(s.maxStamina);
        expect(s.bay).toBe(0);
        expect(s.roundDamage).toBe(0);
        expect(s.greyHp).toBe(s.greyMax);
        // meta survived the reset
        expect(s.light).toBeCloseTo(lightBefore);
        expect(s.tapDamage).toBeCloseTo(dmgBefore);
        expect(game.nodeLevel('d1')).toBeGreaterThan(0);
    });
});

describe('GreyFight — freeing a cat by round-damage record', () => {
    it('crossing the threshold frees the cat, reclaims its location, opens the next, switches active', () => {
        const game = reacher();
        game.startRound();
        const threshold = game.snapshot().nextCatThreshold;
        let freed = false;
        while (!game.isRoundOver) {
            game.takeTurn();
            if (game.snapshot().roundDamage >= threshold) {
                freed = true;
                break;
            }
        }
        expect(freed).toBe(true);
        const events = game.drainEvents();
        expect(events.some(e => e.kind === 'freedCat')).toBe(true);
        expect(events.some(e => e.kind === 'reclaimedLocation' && e.index === 0)).toBe(true);
        expect(events.some(e => e.kind === 'openedLocation' && e.index === 1)).toBe(true);

        const s = game.snapshot();
        expect(s.cats.map(c => c.id)).toContain('scuff');
        expect(s.locations).toHaveLength(2);
        expect(s.locations[0].phase).toBe('reclaimed');
        expect(s.locations[1].phase).toBe('contested');
        expect(s.activeLocationIndex).toBe(1);
        expect(s.activePhase).toBe('contested');
        expect(s.bestRoundDamage).toBeGreaterThanOrEqual(threshold);
        expect(s.nextCatName).toBe('Nona'); // the new frontier
    });

    it('a single high-damage turn frees every cat whose threshold it crosses', () => {
        const game = new GreyFight(
            { tapBase: 1e6, baseStamina: 5, baseHp: 1e12, catThresholdBase: 10, catThresholdGrowth: 2 },
            noCrit
        );
        game.startRound();
        game.takeTurn(); // one ~1e6 turn vaults past many thresholds (10, 20, 40, …)
        const s = game.snapshot();
        expect(s.cats.length).toBeGreaterThan(3); // robo-cat + several freed in the one turn
        expect(s.locations).toHaveLength(s.cats.length); // one location opened per freed cat
        expect(s.activePhase).toBe('contested'); // the new frontier is ready to fight
    });
});

describe('GreyFight — locations', () => {
    it('switching active location resets round-damage (a round belongs to one location)', () => {
        const game = new GreyFight({ tapBase: 10, baseHp: 1e9, catThresholdBase: 1e12, baseStamina: 10 }, noCrit);
        game.startRound();
        game.takeTurn();
        expect(game.snapshot().roundDamage).toBeGreaterThan(0);
        expect(game.setActiveLocation(0)).toBe(true);
        expect(game.snapshot().roundDamage).toBe(0);
    });

    it('setActiveLocation rejects an out-of-range index', () => {
        const game = new GreyFight();
        expect(game.setActiveLocation(5)).toBe(false);
    });
});

describe('GreyFight — cultivation at a reclaimed home', () => {
    /** Drive a game to a reclaimed location 0, active there. */
    function reclaimedAtZero(): GreyFight {
        const game = reacher();
        game.startRound();
        while (!game.isRoundOver && game.snapshot().locations[0].phase === 'contested') game.takeTurn();
        game.drainEvents();
        expect(game.setActiveLocation(0)).toBe(true);
        return game;
    }

    it('a cultivation turn yields resource and advances the colour tier (forward-only)', () => {
        const game = reclaimedAtZero();
        game.startRound();
        const before = game.snapshot();
        expect(before.activePhase).toBe('reclaimed');

        const res = game.takeTurn();
        expect(res.kind).toBe('cultivate');
        if (res.kind !== 'cultivate') throw new Error('expected cultivate');
        expect(res.resourceGained).toBeGreaterThan(0);

        const after = game.snapshot();
        expect(after.locations[0].resource).toBeGreaterThan(before.locations[0].resource);
        expect(after.locations[0].colorTier).toBeGreaterThanOrEqual(before.locations[0].colorTier);

        // forward-only: a few more turns never lowers the tier
        const tier1 = after.locations[0].colorTier;
        game.takeTurn();
        game.takeTurn();
        expect(game.snapshot().locations[0].colorTier).toBeGreaterThanOrEqual(tier1);
    });
});

describe('GreyFight — cat evolution', () => {
    it('evolving spends the location resource, raises strike, and is gated by cost', () => {
        const game = reacher();
        game.startRound();
        while (!game.isRoundOver && game.snapshot().locations[0].phase === 'contested') game.takeTurn();
        game.drainEvents();
        game.setActiveLocation(0);

        // No resource yet → cannot evolve Scuff.
        expect(game.canEvolve('scuff')).toBe(false);
        expect(game.evolveCat('scuff')).toBe(false);

        // Cultivate until there is enough resource for the first evolution.
        game.startRound();
        const cost = game.evolveCost('scuff');
        for (let i = 0; i < 1000 && game.snapshot().locations[0].resource < cost; i++) {
            if (game.isRoundOver) game.startRound();
            game.takeTurn();
        }
        expect(game.canEvolve('scuff')).toBe(true);

        const resBefore = game.snapshot().locations[0].resource;
        const scuffBefore = game.snapshot().cats.find(c => c.id === 'scuff')!.strike;
        expect(game.evolveCat('scuff')).toBe(true);

        const after = game.snapshot();
        expect(after.locations[0].resource).toBeLessThan(resBefore);
        expect(after.cats.find(c => c.id === 'scuff')!.strike).toBeGreaterThan(scuffBefore);
        expect(after.cats.find(c => c.id === 'scuff')!.evoLevel).toBe(1);
        expect(game.drainEvents().some(e => e.kind === 'catEvolved' && e.catId === 'scuff')).toBe(true);
    });
});

describe('GreyFight — per-cat specialist abilities', () => {
    it('Scuff (multiHit) raises tapDamage above an otherwise-identical game without Scuff freed', () => {
        const control = new GreyFight({ ...ABILITY_CFG }, noCrit); // robo-cat only
        const withScuff = gameWith('scuff');
        // Same base config, only difference is Scuff's multi-swipe ⇒ a strictly bigger tap.
        expect(withScuff.snapshot().cats.some(c => c.id === 'scuff')).toBe(true);
        expect(withScuff.tapDamage).toBeGreaterThan(control.tapDamage);
        // Specifically ×(1 + scuffSwipe × level), level = evoLevel + 1 = 1 when freed ⇒ ×1.4.
        expect(withScuff.tapDamage).toBeCloseTo(control.tapDamage * 1.4);
    });

    it('Nona (crewMult) raises catStrike and the boost grows with more cats freed', () => {
        const control = new GreyFight({ ...ABILITY_CFG }, noCrit);
        const withNona = gameWith('nona'); // Scuff + Nona freed (catCount = robo + 2)
        expect(withNona.snapshot().cats.some(c => c.id === 'nona')).toBe(true);
        expect(withNona.catStrike).toBeGreaterThan(control.catStrike);

        // Free more cats: the crew multiplier (× (catCount − 1)) climbs, so catStrike per base-cat rises.
        const more = gameWith('blink'); // Scuff..Blink freed (more cats than the Nona-only game)
        const perCatNona = withNona.catStrike / withNona.snapshot().cats.length;
        const perCatMore = more.catStrike / more.snapshot().cats.length;
        expect(perCatMore).toBeGreaterThan(perCatNona);
    });

    it('Glimmer (lightMult) increases light banked per turn', () => {
        const control = gameWith('nona'); // Scuff + Nona freed, no Glimmer
        const withGlimmer = gameWith('glimmer'); // + Glimmer
        expect(withGlimmer.snapshot().cats.some(c => c.id === 'glimmer')).toBe(true);

        const lightOf = (g: GreyFight): number => {
            const res = g.takeTurn();
            if (res.kind !== 'combat') throw new Error('expected combat');
            return res.light;
        };
        // Glimmer multiplies the light-per-damage factor; even with extra cats adding damage, the per-damage
        // light factor is strictly higher, so compare the light factor directly via banked-light per damage.
        const a = control.takeTurn();
        const b = withGlimmer.takeTurn();
        if (a.kind !== 'combat' || b.kind !== 'combat') throw new Error('expected combat');
        const factorControl = a.light / (a.tapDamage + a.catStrike);
        const factorGlimmer = b.light / (b.tapDamage + b.catStrike);
        expect(factorGlimmer).toBeGreaterThan(factorControl);
        expect(lightOf(withGlimmer)).toBeGreaterThan(0);
    });

    it('Blink (regenSuppress) lowers regenPerTurn', () => {
        const control = gameWith('glimmer'); // Scuff..Glimmer, no Blink
        const withBlink = gameWith('blink'); // + Blink
        expect(withBlink.snapshot().cats.some(c => c.id === 'blink')).toBe(true);
        // Same bay/phase (both freshly started, bay 0), so regen base matches — only Blink's stare differs.
        expect(withBlink.regenPerTurn).toBeLessThan(control.regenPerTurn);
        expect(withBlink.regenPerTurn).toBeCloseTo(control.regenPerTurn * (1 - 0.12)); // floor not hit at lvl 1
    });

    it('Comet (burst) fires on the cometPeriod-th turn of a round, dealing more, and not on other turns', () => {
        const game = gameWith('comet', { cometPeriod: 3 });
        expect(game.snapshot().cats.some(c => c.id === 'comet')).toBe(true);

        const taps: { burst: boolean; tap: number }[] = [];
        for (let i = 0; i < 3; i++) {
            const res = game.takeTurn();
            if (res.kind !== 'combat') throw new Error('expected combat');
            taps.push({ burst: res.burst, tap: res.tapDamage });
        }
        // Turns 1 and 2: normal; turn 3 (cometPeriod-th): burst.
        expect(taps[0].burst).toBe(false);
        expect(taps[1].burst).toBe(false);
        expect(taps[2].burst).toBe(true);
        // The burst turn's strike is strictly larger than a normal turn's.
        expect(taps[2].tap).toBeGreaterThan(taps[0].tap);

        // The counter resets per round: a fresh round's first two turns are normal again.
        game.startRound();
        const r1 = game.takeTurn();
        const r2 = game.takeTurn();
        if (r1.kind !== 'combat' || r2.kind !== 'combat') throw new Error('expected combat');
        expect(r1.burst).toBe(false);
        expect(r2.burst).toBe(false);
    });

    it('Comet does not burst when Comet is not freed', () => {
        const game = gameWith('blink', { cometPeriod: 3 }); // Scuff..Blink, no Comet
        for (let i = 0; i < 6; i++) {
            const res = game.takeTurn();
            if (res.kind !== 'combat') throw new Error('expected combat');
            expect(res.burst).toBe(false);
        }
    });

    it('Tinker (wildcard) raises output and scales with the most-leveled tree', () => {
        // Tinker freed but no tree invested: maxTreeLevels = 0 ⇒ tinkerMult = ×1 (no boost yet).
        const flat = gameWith('tinker', { lightPerDamage: 1e9 });
        const flatTap = flat.tapDamage;

        // The same game, now investing several levels in one tree (Damage d1): Tinker's wildcard scales with it.
        const built = gameWith('tinker', { lightPerDamage: 1e9 });
        built.takeTurn(); // bank light to spend
        let bought = 0;
        for (let i = 0; i < 6 && built.buy('d1'); i++) bought++;
        expect(bought).toBeGreaterThan(2);
        const builtTap = built.tapDamage;

        // Tinker freed with an invested tree out-taps Tinker with no tree (proves it scales with the tree).
        expect(builtTap).toBeGreaterThan(flatTap);

        // And it out-taps the SAME d1 nodes WITHOUT Tinker — so the gain is Tinker's wildcard on top of the
        // nodes, not merely the d1 nodes alone.
        const nodesOnly = new GreyFight({ ...ABILITY_CFG, lightPerDamage: 1e9 }, noCrit);
        nodesOnly.startRound();
        nodesOnly.takeTurn();
        for (let i = 0; i < bought; i++) nodesOnly.buy('d1');
        expect(builtTap).toBeGreaterThan(nodesOnly.tapDamage);
    });

    it('with only the robo-cat freed, the per-turn stats equal their pure non-ability formulas', () => {
        const game = new GreyFight({ ...ABILITY_CFG }, noCrit);
        game.startRound();
        expect(game.snapshot().cats).toHaveLength(1); // robo-cat only — no specialists active
        expect(game.tapDamage).toBeCloseTo(ABILITY_CFG.tapBase); // no Scuff/Tinker boost
        expect(game.catStrike).toBeCloseTo(ABILITY_CFG.catStrike); // no Nona/Tinker boost
        expect(game.regenPerTurn).toBeCloseTo(ABILITY_CFG.baseRegen); // no Blink suppression
    });

    it('Nona boosts the WHOLE crew by 1 + nonaPerCat×level×(catCount−1)', () => {
        const game = gameWith('nona'); // robo + Scuff + Nona freed
        const s = game.snapshot();
        const rawSum = s.cats.reduce((sum, c) => sum + c.strike, 0); // strikes before any multiplier
        const expected = rawSum * (1 + 0.06 * 1 * (s.cats.length - 1)); // nonaPerCat 0.06, level 1, whole crew
        expect(game.catStrike).toBeCloseTo(expected);
    });

    it('Blink respects the regen floor at high suppression (never below floor, never negative)', () => {
        const game = gameWith('blink', { blinkSuppress: 1, blinkFloor: 0.2 });
        // 1 − blinkSuppress×level = 1 − 1 = 0 → clamped up to the floor.
        expect(game.regenPerTurn).toBeCloseTo(ABILITY_CFG.baseRegen * 0.2);
        expect(game.regenPerTurn).toBeGreaterThan(0);
    });
});

describe('GreyFight — skill tree (one connected tree)', () => {
    /** A game whose bay never clears, raining light, so revealed nodes can be bought freely. */
    const rich = (rng = noCrit) => new GreyFight({ baseHp: 1e9, lightPerDamage: 1e9, baseStamina: 100 }, rng);

    it('the root d1 costs light, raises tapDamage; broke buys fail', () => {
        const game = rich();
        expect(game.buy('d1')).toBe(false); // no light yet
        game.startRound();
        game.takeTurn();
        const before = game.snapshot();
        expect(game.buy('d1')).toBe(true);
        const after = game.snapshot();
        expect(after.light).toBeLessThan(before.light);
        expect(after.tapDamage).toBeGreaterThan(before.tapDamage);
    });

    it('the root is revealed at start; its children are revealed only once d1 is bought', () => {
        const game = rich();
        game.startRound();
        game.takeTurn();
        // Root always revealed; its children (c1 / k1 / scuff) hidden until d1 is acquired.
        expect(game.isRevealed('d1')).toBe(true);
        expect(game.isRevealed('c1')).toBe(false);
        expect(game.isRevealed('k1')).toBe(false);
        expect(game.isRevealed('scuff')).toBe(false);
        expect(game.buy('c1')).toBe(false); // hidden ⇒ not buyable
        expect(game.buy('k1')).toBe(false);

        expect(game.buy('d1')).toBe(true);
        expect(game.isRevealed('c1')).toBe(true);
        expect(game.isRevealed('k1')).toBe(true);
        expect(game.isRevealed('scuff')).toBe(true);
        expect(game.buy('c1')).toBe(true); // revealed ⇒ buyable
        expect(game.buy('k1')).toBe(true);
    });

    it('a cat gate node is not buyable, and its branch stays hidden until the cat is freed', () => {
        const game = rich();
        game.startRound();
        game.takeTurn();
        expect(game.buy('d1')).toBe(true); // reveal the Scuff gate
        expect(game.isRevealed('scuff')).toBe(true);

        // The Scuff gate is a cat node — never buyable (no light spend, just a no-op).
        expect(game.canBuy('scuff')).toBe(false);
        expect(game.buy('scuff')).toBe(false);

        // Its children (d2 / d4 / nona) stay hidden until Scuff is freed in combat.
        expect(game.isRevealed('d2')).toBe(false);
        expect(game.isRevealed('d4')).toBe(false);
        expect(game.isRevealed('nona')).toBe(false);
        expect(game.buy('d2')).toBe(false);
    });

    it('freeing Scuff reveals its branch, and the nodeLevel-gated buys then work', () => {
        const game = new GreyFight({ ...ABILITY_CFG, lightPerDamage: 1e9 }, noCrit);
        freeFirstCats(game, 1); // free Scuff (cat node 'scuff' now auto-acquired)
        game.startRound();
        game.takeTurn(); // bank light to spend
        expect(game.snapshot().cats.some(c => c.id === 'scuff')).toBe(true);

        // Scuff freed ⇒ its branch revealed (d2 / d4 / nona).
        expect(game.isRevealed('d2')).toBe(true);
        expect(game.isRevealed('nona')).toBe(true);
        expect(game.buy('d2')).toBe(true); // a Scuff-gated upgrade is now buyable
    });

    it('Endurance (e1, gated behind Blink) is revealed and buyable only once Blink is freed', () => {
        // Without Blink: e1 hidden behind the cat gate, so the buy fails.
        const locked = new GreyFight({ ...ABILITY_CFG, lightPerDamage: 1e9 }, noCrit);
        locked.startRound();
        locked.takeTurn();
        expect(locked.isRevealed('e1')).toBe(false);
        expect(locked.buy('e1')).toBe(false);

        // gameWith('blink') frees Scuff..Blink, which reveals the Blink branch (d3 / e1).
        const game = gameWith('blink', { lightPerDamage: 1e9 });
        game.takeTurn(); // bank light
        expect(game.isRevealed('e1')).toBe(true);
        const before = game.maxStamina;
        expect(game.buy('e1')).toBe(true);
        expect(game.maxStamina).toBeGreaterThan(before);
    });

    it('Openers (o1, gated behind Tinker) raises the starting bay only once Tinker is freed', () => {
        const game = gameWith('tinker', { lightPerDamage: 1e9 });
        game.takeTurn(); // bank light
        expect(game.isRevealed('o1')).toBe(true);
        expect(game.buy('o1')).toBe(true);
        game.startRound(); // a fresh round should now open above bay 0
        expect(game.snapshot().bay).toBeGreaterThan(0);
    });

    it('a node cannot be bought past its max level', () => {
        const game = rich();
        game.startRound();
        game.takeTurn();
        let bought = 0;
        while (game.buy('d1')) bought++;
        expect(bought).toBe(25);
        expect(game.isMaxed('d1')).toBe(true);
    });

    it('cat nodes are never maxed and the stat sums still compute with cat nodes in the tree', () => {
        // A cat node carries no stat/maxLevel — isMaxed must be false and it must never break the stat sums.
        const game = new GreyFight({ ...ABILITY_CFG, lightPerDamage: 1e9 }, noCrit);
        expect(game.isMaxed('scuff')).toBe(false);
        // Pure formulas hold with robo-cat only — the cat nodes in UPGRADE_NODES contribute nothing to #sum.
        game.startRound();
        expect(game.tapDamage).toBeCloseTo(ABILITY_CFG.tapBase);
        expect(game.catStrike).toBeCloseTo(ABILITY_CFG.catStrike);

        // Buying a revealed upgrade still feeds its stat through #sum (cat nodes skipped, no crash).
        game.takeTurn();
        const before = game.tapDamage;
        expect(game.buy('d1')).toBe(true);
        expect(game.tapDamage).toBeGreaterThan(before);
    });

    it('under DEFAULT_TUNING the whole tree is reachable — all six cats (incl. Tinker) free through play', () => {
        // Rain light so buying is never the bottleneck; this isolates the round-damage gate the cats sit
        // behind, and guards against the ×4-growth deadlock where Tinker's branch was unreachable.
        const game = new GreyFight({ lightPerDamage: 1e9 }, noCrit);
        const buyEverythingRevealed = (): void => {
            let bought = true;
            while (bought) {
                bought = false;
                for (const node of UPGRADE_NODES) if (game.buy(node.id)) bought = true;
            }
        };
        for (let round = 0; round < 300 && game.snapshot().cats.length - 1 < 6; round++) {
            game.startRound();
            buyEverythingRevealed();
            while (!game.isRoundOver) game.takeTurn(); // banks round damage → frees cats by threshold
            buyEverythingRevealed(); // spend the round's light on branches a freed cat just revealed
        }
        const freed = game.snapshot().cats.map(c => c.id);
        expect(freed).toContain('tinker'); // the deepest gate is crossable
        expect(game.snapshot().cats.length - 1).toBeGreaterThanOrEqual(6);
    });
});

describe('GreyFight — cloud / aim params', () => {
    it('aim-tree nodes raise the cloud spawn rate, max clouds, hit radius and charged chance', () => {
        const game = new GreyFight({ baseHp: 1e9, lightPerDamage: 1e9, baseStamina: 100 }, noCrit);
        game.startRound();
        game.takeTurn(); // bank light
        const spawn0 = game.spawnRate;
        const hit0 = game.hitRadius;
        const clouds0 = game.maxClouds;
        const charged0 = game.chargedChance;
        expect(game.buy('d1')).toBe(true); // root reveals the aim nodes g1/g2
        expect(game.buy('g1')).toBe(true); // spawnFlat
        expect(game.buy('g2')).toBe(true); // hitFlat
        expect(game.buy('g3')).toBe(true); // cloudFlat (requires g1)
        expect(game.buy('g4')).toBe(true); // chargedFlat (requires g2)
        expect(game.spawnRate).toBeGreaterThan(spawn0);
        expect(game.hitRadius).toBeGreaterThan(hit0);
        expect(game.maxClouds).toBeGreaterThan(clouds0);
        expect(game.chargedChance).toBeGreaterThan(charged0);
    });

    it('a charged cloud pop forces a crit and multiplies the light banked', () => {
        const game = new GreyFight({ baseHp: 1e9 }, noCrit); // rng never crits on its own
        game.startRound();
        const normal = game.takeTurn();
        if (normal.kind !== 'combat') throw new Error('expected combat');
        expect(normal.crit).toBe(false);

        const charged = game.takeTurn({ charged: true });
        if (charged.kind !== 'combat') throw new Error('expected combat');
        expect(charged.crit).toBe(true); // charged forces the crit
        expect(charged.charged).toBe(true);
        expect(charged.light).toBeGreaterThan(normal.light); // ×chargedLightMult (+ the forced crit's bigger hit)
    });
});

describe('formatNumber', () => {
    it('formats across the suffix boundaries, sign-aware, ~3 sig figs', () => {
        expect(formatNumber(0)).toBe('0');
        expect(formatNumber(42)).toBe('42');
        expect(formatNumber(999)).toBe('999');
        expect(formatNumber(1000)).toBe('1k');
        expect(formatNumber(1500)).toBe('1.5k');
        expect(formatNumber(1_234_567)).toBe('1.23m');
        expect(formatNumber(2_000_000_000)).toBe('2b');
        expect(formatNumber(3.4e12)).toBe('3.4t');
        expect(formatNumber(-1500)).toBe('-1.5k');
        // 1e15 = qa, 1e33 = Dc, then scientific past the table.
        expect(formatNumber(1e15)).toBe('1qa');
        expect(formatNumber(1e33)).toBe('1Dc');
        expect(formatNumber(1.23e36)).toMatch(/^1\.23e36$/);
        // near-boundary values must promote the tier, not render "1000k"
        expect(formatNumber(999999)).toBe('1m');
        expect(formatNumber(999999999)).toBe('1b');
        expect(formatNumber(999.6)).toBe('1k');
        // sub-unit values keep a couple of sig figs instead of collapsing to "0"
        expect(formatNumber(0.001)).toBe('0.001');
        expect(formatNumber(NaN)).toBe('NaN');
    });
});
