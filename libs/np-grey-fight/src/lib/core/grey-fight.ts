import {
    CatAbility,
    catDefForIndex,
    CatSnapshot,
    DEFAULT_TUNING,
    FreedCat,
    GreyFightEvent,
    GreyFightSnapshot,
    GreyFightTuning,
    GreyPhase,
    LocationSnapshot,
    LocationState,
    NODE_BY_ID,
    ROBO_CAT,
    StatKind,
    TREES,
    TurnResult,
    UPGRADE_NODES,
} from './grey-fight.model';

/**
 * The grey-fight engine (GDD §4 "Holding the Grey", `docs/grey-fight/design.md`): a pure, Phaser-free,
 * TURN-BASED incremental.
 *
 * Play is a sequence of **rounds**. `startRound()` refills stamina and resets only the active location's
 * *fight* (bay → opener bay, grey HP full, round damage 0) — never the meta. `takeTurn()` resolves ONE
 * turn and spends one stamina; the round ends when stamina hits 0. At a **contested** location each turn is
 * combat (you strike → cats strike → the grey regenerates, damage banks `light` and `roundDamage`); cross a
 * cat's single-round damage threshold and that cat is freed → its location becomes a **reclaimed** home, the
 * next location opens, and the active frontier switches, mid-round. At a **reclaimed** location each turn is
 * a friendly cultivation play-beat that yields the location's resource and advances its colour tier.
 *
 * Pure and deterministic apart from the injected `rng` (crit rolls). No time axis at all — no
 * setInterval/Date/dt — so waiting does nothing. Grants no run power; its whole output is cosmetic.
 */
export class GreyFight {
    readonly #tuning: GreyFightTuning;
    readonly #rng: () => number;

    // Persistent meta.
    #light = 0;
    readonly #levels: Record<string, number> = {};
    /** The robo-cat plus every freed specialist (the robo-cat is index 0 and not tied to a location). */
    readonly #cats: FreedCat[];
    readonly #locations: LocationState[] = [];
    /** Forward-only colour-tier progress per location index (separate from spendable resource). */
    readonly #colorProgress: Record<number, number> = {};
    #bestRoundDamage = 0;

    // Active location + in-round fight state.
    #activeLocationIndex = 0;
    #bay = 0;
    #phase: GreyPhase = 'bay';
    #greyHp = 0;
    #stamina = 0;
    #roundDamage = 0;
    /** Combat turns taken so far this round — drives Comet's periodic burst. Reset in startRound(). */
    #roundTurns = 0;

    #events: GreyFightEvent[] = [];

    constructor(tuning: Partial<GreyFightTuning> = {}, rng: () => number = Math.random) {
        this.#tuning = { ...DEFAULT_TUNING, ...tuning };
        this.#rng = rng;
        // The robo-cat is owned from the start; freed cats are appended as they are won.
        this.#cats = [{ ...ROBO_CAT, strike: this.#tuning.catStrike, evoLevel: 0 }];
        // The colony opens with one contested frontier (index 0 — frees Scuff).
        this.#locations.push(this.#makeLocation(0));
        // The first round is not auto-started; begin with stamina spent so isRoundOver is true.
        this.#bay = this.#openerBay();
        this.#greyHp = this.#greyMax();
    }

    // ---- per-turn stats (getters) ----

    /** Your per-turn strike: (tapBase + Σ tapFlat) × (1 + Σ tapMult), then ×Scuff multi-swipe and ×Tinker. */
    get tapDamage(): number {
        const base = (this.#tuning.tapBase + this.#sum('tapFlat')) * (1 + this.#sum('tapMult'));
        return base * this.#scuffMult() * this.#tinkerMult();
    }

    /** Chance a strike crits, capped. */
    get critChance(): number {
        return Math.min(this.#tuning.critChanceCap, this.#sum('critChance'));
    }

    /** Crit damage multiplier. */
    get critMult(): number {
        return this.#tuning.critMultBase + this.#sum('critMult');
    }

    /**
     * Total per-turn cat strike: (Σ cat.strike + Σ catFlat) × (1 + Σ catMult), then ×Nona crew and ×Tinker.
     * Each cat.strike includes its evolution.
     */
    get catStrike(): number {
        const catTotal = this.#cats.reduce((sum, cat) => sum + cat.strike, 0) + this.#sum('catFlat');
        return catTotal * (1 + this.#sum('catMult')) * this.#nonaMult() * this.#tinkerMult();
    }

    /**
     * The grey's self-heal per turn — grows per bay, harder on a boss, eased by regen-reduction nodes and
     * Blink's stare (regen-suppression).
     */
    get regenPerTurn(): number {
        const base = this.#tuning.baseRegen * this.#tuning.regenGrowth ** this.#bay;
        const phaseMult = this.#phase === 'boss' ? this.#tuning.bossRegenMult : 1;
        return base * phaseMult * this.#regenReduction() * this.#blinkMult();
    }

    /** Max stamina (turns per round): baseStamina + Σ staminaFlat. */
    get maxStamina(): number {
        return this.#tuning.baseStamina + this.#sum('staminaFlat');
    }

    /** Grey-cloud spawn rate (clouds/sec) the scene spawns tap targets at: base + Σ spawnFlat. */
    get spawnRate(): number {
        return this.#tuning.baseSpawnRate + this.#sum('spawnFlat');
    }

    /** Max grey clouds on screen at once: base + Σ cloudFlat (floored to a whole count). */
    get maxClouds(): number {
        return Math.floor(this.#tuning.baseMaxClouds + this.#sum('cloudFlat'));
    }

    /** Tap hit radius (px) — the size of a cloud's tappable area: base + Σ hitFlat. */
    get hitRadius(): number {
        return this.#tuning.baseHitRadius + this.#sum('hitFlat');
    }

    /** Chance a spawned cloud is charged (gold → crit + bonus light), capped: min(cap, Σ chargedFlat). */
    get chargedChance(): number {
        return Math.min(this.#tuning.chargedChanceCap, this.#sum('chargedFlat'));
    }

    /** Turns remaining this round. */
    get stamina(): number {
        return this.#stamina;
    }

    /** True once the round's stamina is spent. */
    get isRoundOver(): boolean {
        return this.#stamina <= 0;
    }

    // ---- round + turn ----

    /**
     * Begin a round at the active location: refill stamina, and (for a contested location) reset the fight
     * to bay = opener bay, full grey, round damage 0. Persistent meta is untouched. A reclaimed location has
     * no fight — only stamina is refilled.
     */
    startRound(): void {
        this.#stamina = this.maxStamina;
        this.#roundTurns = 0;
        if (this.#activeLocation().phase === 'contested') {
            this.#bay = this.#openerBay();
            this.#phase = 'bay';
            this.#greyHp = this.#greyMax();
            this.#roundDamage = 0;
        }
    }

    /**
     * Resolve ONE turn at the active location and spend one stamina. A no-op (`kind: 'none'`) if the round
     * is over. Pushes a `roundOver` event when this turn empties the stamina budget. `opts.charged` (set by
     * the scene when a popped cloud was a charged/gold one) forces a crit and multiplies the turn's light.
     */
    takeTurn(opts: { charged?: boolean } = {}): TurnResult {
        if (this.isRoundOver) return { kind: 'none' };
        const result =
            this.#activeLocation().phase === 'contested'
                ? this.#combatTurn(opts.charged ?? false)
                : this.#cultivateTurn();
        this.#stamina -= 1;
        if (this.#stamina <= 0) this.#events.push({ kind: 'roundOver' });
        return result;
    }

    // ---- locations ----

    /**
     * Switch the active location to any reclaimed home or the current frontier. Does NOT start a round, but
     * DOES end any round accounting (round damage → 0) — a round belongs to one location, so leaving abandons
     * it and the next visit starts fresh. Returns false for an out-of-range index.
     */
    setActiveLocation(index: number): boolean {
        const location = this.#locations[index];
        if (!location) return false;
        this.#activeLocationIndex = index;
        this.#roundDamage = 0;
        if (location.phase === 'contested') {
            // Land on the frontier ready to fight; the caller decides when to start the round.
            this.#bay = this.#openerBay();
            this.#phase = 'bay';
            this.#greyHp = this.#greyMax();
        }
        return true;
    }

    // ---- cat evolution (resource-funded per-cat lines) ----

    /** Evolution level of the cat housed by location `catIndexForId(catId)`. */
    catEvoLevel(catId: string): number {
        return this.#findCat(catId)?.evoLevel ?? 0;
    }

    /** Resource cost of the next evolution of a freed cat (geometric in its evolution level). */
    evolveCost(catId: string): number {
        return this.#tuning.evoCostBase * this.#tuning.evoCostGrowth ** this.catEvoLevel(catId);
    }

    /** True when the cat is freed and its location holds enough resource for the next evolution. */
    canEvolve(catId: string): boolean {
        const location = this.#locationForCat(catId);
        if (!location || !this.#findCat(catId)) return false;
        return location.resource >= this.evolveCost(catId);
    }

    /**
     * Evolve a freed cat: spend its location's resource, +1 evolution level, and raise its per-turn strike.
     * Forward-only. Colour depth is driven solely by cultivation, so evolution never touches the tier (this
     * keeps the two color drivers independent — see design.md). Returns whether it happened.
     */
    evolveCat(catId: string): boolean {
        if (!this.canEvolve(catId)) return false;
        const cat = this.#findCat(catId)!;
        const location = this.#locationForCat(catId)!;
        location.resource -= this.evolveCost(catId);
        cat.evoLevel += 1;
        cat.strike = this.#tuning.catStrike + this.#tuning.evoStrikePerLevel * cat.evoLevel;
        this.#events.push({ kind: 'catEvolved', catId, level: cat.evoLevel });
        return true;
    }

    // ---- upgrade web (light-funded) ----

    /** Bought level of an upgrade node (0 for cat nodes, which are never "bought"). */
    nodeLevel(id: string): number {
        return this.#levels[id] ?? 0;
    }

    /** Cost of the next level of an upgrade node (geometric); ∞ for a cat node (never buyable). */
    costFor(id: string): number {
        const node = NODE_BY_ID[id];
        if (node.kind !== 'upgrade') return Infinity;
        return node.baseCost * node.costGrowth ** this.nodeLevel(id);
    }

    /**
     * A node is **revealed** once its parent is *acquired* (the root, with no parent, is always revealed).
     * The tree unfolds by this rule: buying an upgrade reveals its children; freeing a cat reveals its branch.
     */
    isRevealed(id: string): boolean {
        const requires = NODE_BY_ID[id].requires;
        return !requires || this.#isAcquired(requires);
    }

    /** True only at an upgrade node already maxed out (a cat node is never "maxed"). */
    isMaxed(id: string): boolean {
        const node = NODE_BY_ID[id];
        return node.kind === 'upgrade' && this.nodeLevel(id) >= node.maxLevel;
    }

    canAfford(id: string): boolean {
        return this.#light >= this.costFor(id);
    }

    /**
     * Everything that must be true to buy: an **upgrade** node (cat nodes are never buyable), revealed, not
     * maxed, and affordable.
     */
    canBuy(id: string): boolean {
        return NODE_BY_ID[id].kind === 'upgrade' && this.isRevealed(id) && !this.isMaxed(id) && this.canAfford(id);
    }

    /** Buy one level of an upgrade node if allowed; returns whether the purchase happened. */
    buy(id: string): boolean {
        if (!this.canBuy(id)) return false;
        this.#light -= this.costFor(id);
        this.#levels[id] = this.nodeLevel(id) + 1;
        return true;
    }

    // ---- events + snapshot ----

    /** Take and clear the queued transition events (for the view to celebrate). */
    drainEvents(): GreyFightEvent[] {
        const events = this.#events;
        this.#events = [];
        return events;
    }

    snapshot(): GreyFightSnapshot {
        const contested = this.#activeLocation().phase === 'contested';
        return {
            activeLocationIndex: this.#activeLocationIndex,
            activePhase: this.#activeLocation().phase,
            locations: this.#locations.map(loc => this.#locationSnapshot(loc)),
            bay: this.#bay,
            phase: this.#phase,
            greyHp: this.#greyHp,
            greyMax: this.#greyMax(),
            stamina: this.#stamina,
            maxStamina: this.maxStamina,
            isRoundOver: this.isRoundOver,
            roundDamage: this.#roundDamage,
            bestRoundDamage: this.#bestRoundDamage,
            light: this.#light,
            cats: this.#cats.map(cat => this.#catSnapshot(cat)),
            tapDamage: this.tapDamage,
            critChance: this.critChance,
            critMult: this.critMult,
            catStrike: this.catStrike,
            regenPerTurn: this.regenPerTurn,
            netPerTurn: contested ? this.tapDamage + this.catStrike - this.regenPerTurn : 0,
            nextCatThreshold: this.#nextCatThreshold(),
            nextCatName: catDefForIndex(this.#frontierIndex()).name,
        };
    }

    // ---- internals: combat ----

    /** One contested turn: you strike → cats strike → grey regenerates; bank light + round damage. A charged
     * (gold) cloud forces the crit and multiplies the light banked this turn. */
    #combatTurn(charged: boolean): TurnResult {
        // This is the Nth combat turn of the round (1-based) — drives Comet's periodic burst.
        this.#roundTurns += 1;
        const crit = charged || this.#rng() < this.critChance;
        const cometLevel = this.#abilityLevel('burst');
        const burst = cometLevel > 0 && this.#tuning.cometPeriod > 0 && this.#roundTurns % this.#tuning.cometPeriod === 0; // prettier-ignore
        const burstBonus = burst ? this.tapDamage * this.#tuning.cometBurst * cometLevel : 0;
        const tapDamage = this.tapDamage * (crit ? this.critMult : 1) + burstBonus;
        const catStrike = this.catStrike;
        const regen = this.regenPerTurn;

        // Heal first (regen works against you), then your strike + the cats' lands.
        const before = this.#greyHp;
        const healed = Math.min(this.#greyMax(), before + regen);
        const dealt = tapDamage + catStrike;
        this.#greyHp = healed - dealt;
        // Net HP the grey actually lost this turn = your output beyond the heal it managed (≥ 0).
        const damage = Math.max(0, dealt - (healed - before));

        const light = dealt * this.#lightFactor() * (charged ? this.#tuning.chargedLightMult : 1);
        this.#light += light;
        this.#roundDamage += dealt;
        if (this.#roundDamage > this.#bestRoundDamage) this.#bestRoundDamage = this.#roundDamage;

        if (this.#greyHp <= 0) this.#advanceWall();
        // Crossing the frontier cat's threshold frees it (by round-damage record), opening the next location.
        this.#maybeFreeFrontierCat();

        return { kind: 'combat', tapDamage, crit, catStrike, regen, damage, light, burst, charged };
    }

    /** A bay clears into its boss; a boss clears into the next, escalated bay. (No cat-freeing here.) */
    #advanceWall(): void {
        if (this.#phase === 'bay') {
            this.#phase = 'boss';
            this.#events.push({ kind: 'enteredBoss', bay: this.#bay });
        } else {
            this.#bay += 1;
            this.#phase = 'bay';
        }
        this.#greyHp = this.#greyMax();
    }

    /**
     * Free the frontier cat the moment the round's total damage crosses its threshold: flip the frontier to
     * a reclaimed home, open the next location, and switch the active fight there (resetting it) while the
     * round/stamina continue.
     */
    #maybeFreeFrontierCat(): void {
        // A single high-damage turn can vault past several thresholds — free every cat crossed this round.
        // The threshold grows per location, so this loop always terminates.
        while (this.#activeLocation().phase === 'contested' && this.#roundDamage >= this.#nextCatThreshold()) {
            const frontier = this.#activeLocation();

            // Free the cat (its per-turn strike includes any later evolution; starts unevolved).
            const def = catDefForIndex(frontier.index);
            const cat: FreedCat = { ...def, strike: this.#tuning.catStrike, evoLevel: 0 };
            this.#cats.push(cat);
            this.#events.push({ kind: 'freedCat', cat });

            // Reclaim the frontier, open the next location, and move the fight onto it.
            frontier.phase = 'reclaimed';
            this.#events.push({ kind: 'reclaimedLocation', index: frontier.index });
            const nextIndex = frontier.index + 1;
            this.#locations.push(this.#makeLocation(nextIndex));
            this.#events.push({ kind: 'openedLocation', index: nextIndex });

            this.#activeLocationIndex = nextIndex;
            this.#bay = this.#openerBay();
            this.#phase = 'bay';
            this.#greyHp = this.#greyMax();
        }
    }

    // ---- internals: cultivation ----

    /** One reclaimed turn: yield the location's resource and advance its colour tier (forward-only). */
    #cultivateTurn(): TurnResult {
        const location = this.#activeLocation();
        const resourceGained = (this.tapDamage + this.catStrike) * this.#tuning.resourceFactor;
        location.resource += resourceGained;

        // Accumulate play toward the next colour tier (tracked as a fraction of the current cost in resource
        // terms is overkill; we advance whenever the location's banked resource has earned a tier this turn).
        let colorTierUp = false;
        const cost = this.#tuning.colorTierCost * this.#tuning.colorTierGrowth ** location.colorTier;
        // Use a dedicated colour-progress ledger so spending resource on evolution never rewinds tiers.
        const progress = (this.#colorProgress[location.index] ?? 0) + resourceGained;
        if (progress >= cost) {
            location.colorTier += 1;
            colorTierUp = true;
            this.#colorProgress[location.index] = progress - cost;
            this.#events.push({ kind: 'colorTierUp', index: location.index, tier: location.colorTier });
        } else {
            this.#colorProgress[location.index] = progress;
        }

        return { kind: 'cultivate', resourceGained, colorTierUp };
    }

    // ---- internals: helpers ----

    #makeLocation(index: number): LocationState {
        return { index, catId: catDefForIndex(index).id, phase: 'contested', colorTier: 0, resource: 0 };
    }

    #activeLocation(): LocationState {
        return this.#locations[this.#activeLocationIndex];
    }

    /** The index of the current contested frontier (the highest-index location). */
    #frontierIndex(): number {
        return this.#locations.length - 1;
    }

    /** Single-round damage needed to free the current frontier cat. */
    #nextCatThreshold(): number {
        const index = this.#frontierIndex();
        return this.#tuning.catThresholdBase * this.#tuning.catThresholdGrowth ** index;
    }

    #findCat(catId: string): FreedCat | undefined {
        return this.#cats.find(cat => cat.id === catId);
    }

    /** The location whose housed cat is `catId` (named cat or kitten id). */
    #locationForCat(catId: string): LocationState | undefined {
        return this.#locations.find(loc => loc.catId === catId);
    }

    /** True if a node is acquired: an upgrade bought to ≥ 1 level, or a cat that has been freed. */
    #isAcquired(id: string): boolean {
        const node = NODE_BY_ID[id];
        return node.kind === 'cat' ? this.#cats.some(cat => cat.id === node.catId) : this.nodeLevel(id) >= 1;
    }

    /** Sum of `perLevel × level` over every upgrade node feeding the given additive stat (cat nodes skipped). */
    #sum(stat: StatKind): number {
        let total = 0;
        for (const node of UPGRADE_NODES) {
            if (node.kind === 'upgrade' && node.stat === stat) total += node.perLevel * this.nodeLevel(node.id);
        }
        return total;
    }

    /** Product of `perLevel^level` over the regen-reduction upgrade nodes (perLevel < 1, so it lowers regen). */
    #regenReduction(): number {
        let factor = 1;
        for (const node of UPGRADE_NODES) {
            if (node.kind === 'upgrade' && node.stat === 'regenMult') factor *= node.perLevel ** this.nodeLevel(node.id); // prettier-ignore
        }
        return factor;
    }

    /** Light earned per point of damage — scaled by the Economy light-gain nodes and Glimmer's prism. */
    #lightFactor(): number {
        return this.#tuning.lightPerDamage * (1 + this.#sum('lightMult')) * this.#glimmerMult();
    }

    // ---- internals: per-cat specialist abilities ----

    /**
     * The ability level for a given ability kind: `evoLevel + 1` for the freed cat that has it (active when
     * freed, stronger when evolved), or 0 if no freed cat in the roster has that ability. Each ability is
     * computed only if its specialist is freed — otherwise its multiplier helper returns the neutral value.
     */
    #abilityLevel(kind: CatAbility): number {
        const cat = this.#cats.find(c => c.ability === kind);
        return cat ? cat.evoLevel + 1 : 0;
    }

    /** Scuff (multiHit): × tapDamage by (1 + scuffSwipe × level); 1 if Scuff isn't freed. */
    #scuffMult(): number {
        return 1 + this.#tuning.scuffSwipe * this.#abilityLevel('multiHit');
    }

    /** Nona (crewMult): × catStrike by (1 + nonaPerCat × level × (catCount − 1)); 1 if Nona isn't freed. */
    #nonaMult(): number {
        return 1 + this.#tuning.nonaPerCat * this.#abilityLevel('crewMult') * (this.#cats.length - 1);
    }

    /** Glimmer (lightMult): × the light-per-damage factor by (1 + glimmerLight × level); 1 if Glimmer isn't freed. */
    #glimmerMult(): number {
        return 1 + this.#tuning.glimmerLight * this.#abilityLevel('lightMult');
    }

    /** Blink (regenSuppress): × regen by max(blinkFloor, 1 − blinkSuppress × level); 1 if Blink isn't freed. */
    #blinkMult(): number {
        const level = this.#abilityLevel('regenSuppress');
        if (level === 0) return 1;
        return Math.max(this.#tuning.blinkFloor, 1 - this.#tuning.blinkSuppress * level);
    }

    /**
     * Tinker (wildcard): × both tapDamage and catStrike by (1 + tinkerBonus × level × maxTreeLevels), where
     * maxTreeLevels is the largest sum of node levels across the six trees (rewards a committed build). 1 if
     * Tinker isn't freed.
     */
    #tinkerMult(): number {
        const level = this.#abilityLevel('wildcard');
        if (level === 0) return 1;
        return 1 + this.#tuning.tinkerBonus * level * this.#maxTreeLevels();
    }

    /** The largest sum of bought levels across the six upgrade families — Tinker's "your most-leveled tree". */
    #maxTreeLevels(): number {
        let max = 0;
        for (const tree of TREES) {
            let sum = 0;
            for (const node of UPGRADE_NODES) {
                if (node.kind === 'upgrade' && node.tree === tree.id) sum += this.nodeLevel(node.id);
            }
            if (sum > max) max = sum;
        }
        return max;
    }

    /** The starting bay of a round = Σ openerBay (Openers tree). */
    #openerBay(): number {
        return this.#sum('openerBay');
    }

    /** The current mass's full HP — the bay clear threshold, ×bossHpMult during a boss. */
    #greyMax(): number {
        const bayClear = this.#tuning.baseHp * this.#tuning.hpGrowth ** this.#bay;
        return this.#phase === 'boss' ? bayClear * this.#tuning.bossHpMult : bayClear;
    }

    #locationSnapshot(loc: LocationState): LocationSnapshot {
        return {
            index: loc.index,
            catId: loc.catId,
            phase: loc.phase,
            colorTier: loc.colorTier,
            resource: loc.resource,
        };
    }

    #catSnapshot(cat: FreedCat): CatSnapshot {
        return {
            id: cat.id,
            name: cat.name,
            ability: cat.ability,
            blurb: cat.blurb,
            color: cat.color,
            strike: cat.strike,
            evoLevel: cat.evoLevel,
        };
    }
}
