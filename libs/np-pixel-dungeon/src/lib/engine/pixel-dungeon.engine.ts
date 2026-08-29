import { Balance, BESTIARY, DungeonAiParams, DungeonCombatParams, DungeonPlan, ITEMS } from '@shared/np-config';
import { NPRng } from '@shared/np-library';
import type { DungeonObjective, DungeonResult } from '@shared/np-state';
import * as Phaser from 'phaser';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';
import StateManager from 'phaser4-rex-plugins/plugins/logic/statemanager/StateManager';

import { EFeatureKind, NPSceneWithBoard } from '../@types/pixel-dungeon.types';
import { PixelDungeonPathfinder } from '../core/pixel-dungeon.pathfinder';
import { PixelDungeonDecorator } from '../dungeon/pixel-dungeon.decorator';
import { PixelDungeonLevel } from '../dungeon/pixel-dungeon.level';
import { MobFactory } from '../sprites/mob-factory';
import { EMobInfoType, PixelDungeonInfoText } from '../sprites/pixel-dungeon.info-text';
import { PixelDungeonItem } from '../sprites/pixel-dungeon.item';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../sprites/pixel-dungeon.player';
import { PixelDungeonEvents } from './pixel-dungeon.events';
import { EndGameState } from './states/end-game.state';
import { HandleActionState } from './states/handle-action.state';
import { StartGameState } from './states/start-game.state';
import { States } from './states/states';

/**
 * What the scene injects into the engine when starting a dungeon run (Leet F1). All optional: an empty
 * `{}` reproduces the old hard-wired standalone/debug run exactly (same seed, same 25×25 size, same
 * roster), so the debug entry path is a behavioural no-op. The run-driven path fills these in from the
 * launch contract so generation and the result hand-off stop being hard-coded literals.
 */
export interface TPixelDungeonEngineOptions {
    /** The run's goal for this excursion ({@link DungeonObjective}); stored for the objective-driven exit (later tasks). */
    objective?: DungeonObjective;
    /** Generation seed — `undefined` keeps the historical `'<#.#>'` default (identical layout). */
    seed?: string;
    /** The sector/floor depth this run sits at; stored for depth-scaled content (later tasks). */
    depth?: number;
    /**
     * The enemy roster for this floor (item #10 / F3): archetype ids — keys of np-config's `BESTIARY` — to
     * spawn, one mob per id. The app fills it from `Balance.dungeonRoster(depth)`, so the count and mix scale
     * with depth. Each id is resolved through `Balance.mobDef` and built by `MobFactory`. Omitted
     * (standalone/debug entry) the engine falls back to {@link DEFAULT_ROSTER} so a bare run still has enemies.
     */
    roster?: string[];
    /**
     * The loot plan for this floor (RPG cluster A): item ids — keys of np-config's `ITEMS` catalog — to
     * scatter on walkable floor tiles. The app fills it from `Balance.dungeonLoot(depth)`; an unknown id
     * is skipped (logged). Omitted (standalone/debug entry), the floor is bare and the run carries out no
     * loot — a behavioural no-op for the old fixed run.
     */
    loot?: string[];
    /**
     * The equipment the player starts this run carrying (item #13): item ids — keys of np-config's `ITEMS`
     * catalog, each an *equipment* entry (a `slot` + `mods`). The engine resolves each through `ITEMS` and
     * `player.combat.equip(def)`s it, so its mods fold into the player's combat stats. The app fills it from
     * `Balance.startingEquipment(petClass)` (or the launch's declared set). Omitted (standalone/debug entry)
     * the player starts bare — base bestiary stats, no regression. An unknown id is skipped (logged).
     */
    startingEquipment?: string[];
    /**
     * Combat tuning the run injects (the app resolves it via `Balance.dungeonCombatParams()`). The pure
     * `resolveDamage` reads it; left out (standalone/debug entry) it falls back to {@link DEFAULT_COMBAT_PARAMS}.
     */
    combatParams?: DungeonCombatParams;
    /**
     * Mob-AI tuning the run injects (item #12): sight/wake radii, give-up turns, wander chance, flee fraction
     * — the depth-scaled numbers the pure {@link decideDungeonAi} reads. The app resolves it via
     * `Balance.dungeonAiParams(depth)`. Omitted (standalone/debug entry) it falls back to {@link DEFAULT_AI_PARAMS},
     * so a bare run's enemies still sleep, wake, hunt, give up and flee with sane defaults.
     */
    aiParams?: DungeonAiParams;
    /**
     * The world-content plan for this floor (RPG cluster C): trap/lock budgets the {@link PixelDungeonDecorator}
     * will draw on (#14). The app resolves it via `Balance.dungeonPlan(depth)`. Omitted (standalone/debug
     * entry) it falls back to {@link DEFAULT_PLAN}. Step 0 places only the exit stairs, which the decorator
     * does regardless of the plan, so the floor still gets its objective-exit even with the default.
     */
    plan?: DungeonPlan;
    /** Invoked exactly once when the run ends, reporting the typed outcome back to the conductor. */
    onResult?: (result: DungeonResult) => void;
}

/**
 * The lib's combat fallback for the standalone/debug entry path (engine built with `{}`): a `minDamage`
 * floor of 1, identical to np-config's `DUNGEON_COMBAT`. So a debug run still does real damage without
 * the app having to inject anything — combat is never inert.
 */
const DEFAULT_COMBAT_PARAMS: DungeonCombatParams = { minDamage: 1 };

/**
 * The lib's mob-AI fallback for the standalone/debug entry path (engine built with `{}`, item #12): the
 * sector-1 baseline of np-config's `DUNGEON_AI`. So a debug run's enemies still sleep, wake on approach,
 * hunt, give up after losing sight and flee at low HP without the app having to inject anything. The run
 * path passes a real, depth-scaled `Balance.dungeonAiParams(depth)`.
 */
const DEFAULT_AI_PARAMS: DungeonAiParams = {
    sightRange: 4,
    wakeOnSpotRadius: 3,
    loseTargetAfterTurns: 4,
    wanderChance: 0.6,
    fleeBelowHpPct: 0.25,
    alertRadius: 4,
};

/**
 * The lib's world-content fallback for the standalone/debug entry path (engine built with `{}`): no traps,
 * no locks — so a debug run still gets a fully decorated floor (the exit stairs are placed regardless of
 * the plan) without the app having to inject anything. Mirrors np-config's step-0 sector-1 plan.
 */
const DEFAULT_PLAN: DungeonPlan = { trapCount: 0, lockCount: 0 };

/**
 * The lib's enemy-roster fallback for the standalone/debug entry path (engine built with `{}`, item #10):
 * three basic skeletons — the historical hard-coded floor — so a debug run still spawns enemies without the
 * app having to inject a roster. The run path passes a real, depth-scaled roster from `Balance.dungeonRoster`.
 */
const DEFAULT_ROSTER: readonly string[] = ['skeleton', 'skeleton', 'skeleton'];

export class PixelDungeonEngine extends StateManager {
    player!: PixelDungeonPlayer;
    mobs!: PixelDungeonMob[];
    #pathfinder!: PixelDungeonPathfinder;
    #level!: PixelDungeonLevel;
    // The active turn-loop state, kept so killMob can scrub a dead mob from its ready set too (the exact
    // both-lists desync the REVIEW warns about — `engine.mobs` AND the loop's private ready queue).
    #handleAction!: HandleActionState;
    readonly #events = new PixelDungeonEvents();
    #turn = 0;

    // The goal + depth this run was launched with — stored now for the depth/objective-scaled content of
    // later tasks; only `seed` actually shapes generation today.
    readonly #objective?: DungeonObjective;
    readonly #depth?: number;
    // The pending game-over outcome and a one-shot guard: the engine owns reporting, so a double endGame()
    // (e.g. the debug bail racing a real exit) can't fire `onResult` twice or re-enter EndGame.
    #result?: DungeonResult;
    #over = false;

    // Loot picked up this run (RPG cluster A) — item ids, in pickup order. Carried out in the `completed`
    // result; lost on a lethal failure (roguelike convention), so it's only read on the victory path.
    readonly #collectedLoot: string[] = [];

    constructor(
        public scene: NPSceneWithBoard,
        private readonly options: TPixelDungeonEngineOptions = {}
    ) {
        super({ scene, eventEmitter: false });
        this.#objective = options.objective;
        this.#depth = options.depth;
        // Refresh vision off the bus rather than a direct cross-cutting call: a step now just emits
        // 'mob:moved' and this subscriber owns the render/vision response.
        this.#events.on('mob:moved', ({ mob }) => this.#onMobMoved(mob));
        // Auto-pickup (RPG cluster A) + the objective-driven exit (RPG cluster C): every step fires
        // 'mob:entered-tile'; when the *player* lands on a tile, collect any item there and check for the
        // exit stairs. Enemies ignore both. This is the trigger hook the bus was built for — no turn-loop
        // edit needed. Pickup runs before the exit check so the stairs run carries the just-grabbed loot.
        this.#events.on('mob:entered-tile', ({ mob, tile }) => {
            if (mob !== this.player) return;
            const item = this.level.getItemAt(tile);
            if (item) this.collectItem(mob, item);
            this.#checkExit(tile);
        });
        // The dungeon scene is non-persistent and rebuilt each entry, so drop all handlers on shutdown
        // to keep subscriptions from leaking across runs.
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.#events.clear());
        this.#setup();
    }

    #setup() {
        // `?? '<#.#>'` preserves the historical fixed-layout default when launched without a seed; the run
        // path passes a real one. Size stays a constant for now (depth scaling is a later task).
        const options = { height: 25, width: 25, seed: this.options.seed ?? '<#.#>' };
        this.#level = new PixelDungeonLevel(this, options);

        // Build the player from the bestiary (item #10): its stat block (HP/attack/defense, speed, vision,
        // sheet) is np-config data, not hard-coded in player.ts. `BESTIARY.brawler` is the player class — the
        // numbers that used to be placeholder defaults inline. Imported directly like `ITEMS`, since the
        // player class is a fixed lookup, not a depth-scaled roll.
        this.player = new PixelDungeonPlayer(this, MobFactory.defToOptions(BESTIARY.brawler));
        this.mobs = [this.player];

        // Spawn enemies from the injected roster (item #10): one mob per archetype id, each resolved through
        // np-config's bestiary (`Balance.mobDef`) and built by `MobFactory`. The roster's length drives the
        // count and its ids the mix — both scaled by depth in the app. Falling back to DEFAULT_ROSTER keeps
        // the standalone/debug path (engine built with `{}`) spawning the historical three skeletons.
        const roster = this.options.roster ?? DEFAULT_ROSTER;
        roster.forEach(id => this.mobs.push(MobFactory.spawn(this, Balance.mobDef(id))));

        this.#handleAction = new HandleActionState(this.player);
        this.addStates([new StartGameState(), this.#handleAction, new EndGameState()]);
    }

    /**
     * The generation seed this run used (`'<#.#>'` for the standalone/debug default). Read by deterministic
     * sub-systems that must reproduce off the same seed — the decorator's RNG and each enemy's `MobBrain`
     * RNG derive from it (suffixed per concern), so the same seed yields the same dungeon AND the same AI.
     */
    get seed(): string {
        return this.options.seed ?? '<#.#>';
    }

    /** The run goal this dungeon was launched with (objective-driven exit lands with later tasks). */
    get objective(): DungeonObjective | undefined {
        return this.#objective;
    }

    /** The sector/floor depth this run sits at (depth-scaled content lands with later tasks). */
    get depth(): number | undefined {
        return this.#depth;
    }

    /** The combat tuning for this run (injected, else the lib fallback). `resolveDamage` reads this. */
    get combatParams(): DungeonCombatParams {
        return this.options.combatParams ?? DEFAULT_COMBAT_PARAMS;
    }

    /** The mob-AI tuning for this run (injected, else the lib fallback). Each `MobBrain` reads this. */
    get aiParams(): DungeonAiParams {
        return this.options.aiParams ?? DEFAULT_AI_PARAMS;
    }

    /** Whether the run has ended (death / victory). The turn loop checks this to bail before the next pump. */
    get isOver(): boolean {
        return this.#over;
    }

    preload(): void {
        this.level.preload();
        this.mobs.forEach(mob => mob.preload());
    }

    create(): void {
        this.level.create();
        this.#pathfinder = new PixelDungeonPathfinder(this, this.level.board);
        this.#addMobs();
        this.#equipPlayer();
        this.#spawnLoot();
        this.#decorate();

        this.updateFoV();
        this.events.emit('level:created', { level: this.level });
    }

    /**
     * Run the post-carve world-content decorator (RPG cluster C, step 0) and place its features on the
     * level. Deterministic: the decorator's RNG is seeded from this run's generation seed (suffixed so it
     * draws a distinct stream from generation but the same seed still reproduces the same decoration). The
     * plan comes from the injected option, falling back to the lib's no-trap/no-lock {@link DEFAULT_PLAN}.
     * Step 0 returns exactly the exit stairs.
     */
    #decorate() {
        const rng = new NPRng(`${this.seed}#decorate`);
        const plan = this.options.plan ?? DEFAULT_PLAN;
        const features = new PixelDungeonDecorator(this.scene).decorate(this.level.dungeon, plan, rng);
        features.forEach(feature => this.level.addFeature(feature, feature.tileX, feature.tileY));
    }

    /**
     * The objective-driven exit (RPG cluster C, step 0). When the player steps onto the exit stairs the run
     * is won — it `completed`, carrying out the collected loot, EXACTLY like the all-enemies-dead path in
     * {@link killMob}. The two completion routes coexist: whichever fires first wins (and `endGame` is
     * one-shot-guarded, so a stairs step in the same instant as the last kill can't double-report).
     */
    #checkExit(tile: TileXYType) {
        const feature = this.level.getFeatureAt(tile);
        if (feature?.kind !== EFeatureKind.stairsDown) return;
        this.endGame({ kind: 'dungeon', outcome: 'completed', loot: [...this.#collectedLoot] });
    }

    #addMobs() {
        // Place mobs on distinct walkable tiles of the starting room (player first) instead of a
        // blind vertical line, which could otherwise drop mobs onto walls or stack them.
        const spots = this.level.spawnTiles(this.mobs.length);
        this.mobs.forEach((mob, i) => {
            const spot = spots[i] ?? spots[spots.length - 1];
            this.level.addMob(mob, spot.x, spot.y);
        });
        // needs to be added to the board to work... Field of view needs it
        this.mobs.forEach(mob => mob.create());

        this.mobs.forEach(mob => {
            mob.setDepth(5);
            this.scene.add.existing(mob);
        });
    }

    /**
     * Equip the player's starting gear (item #13 / equipment & combat stats). For each injected id, resolve
     * its {@link ItemDef} through np-config's `ITEMS` catalog and `player.combat.equip(def)` it, so the item's
     * `mods` fold into the player's combat-stat getters. Runs **after** `#addMobs` (which calls `mob.create()`,
     * the point `MobCombat` is built), so `player.combat` exists. The player starts at full HP at its
     * *equipped* maximum: `MobCombat`'s constructor seeded `#hp = maxHp`, and equipping a `+maxHp` item only
     * raises the cap — it does NOT refill — but since we equip before the player takes any damage, full HP and
     * the raised cap coincide here. Omitted (standalone/debug entry) the player stays bare — base stats, no
     * regression; an unknown id is skipped with a warning so a stale loadout can't crash the run.
     */
    #equipPlayer() {
        (this.options.startingEquipment ?? []).forEach(id => {
            const def = ITEMS[id];
            if (!def) {
                console.warn(`PixelDungeon: startingEquipment references unknown item id "${id}" — skipping`);
                return;
            }
            this.player.combat.equip(def);
        });
        // Re-seed current HP to the now-equipped maximum: `MobCombat`'s ctor set #hp from the un-equipped
        // base maxHp, so an equipped +maxHp would otherwise leave the player short of its new cap on spawn.
        // (A heal clamps to maxHp, so a full heal is the clean way to top up to the freshly-raised cap.)
        this.player.combat.heal(this.player.combat.maxHp);
    }

    /**
     * Scatter this floor's loot plan (RPG cluster A). For each item id in `options.loot`, resolve its
     * {@link ItemDef} via np-config's `ITEMS` catalog and drop a {@link PixelDungeonItem} on a random
     * walkable floor tile. Tiles are picked **distinct** (one item per tile) and the mob spawn tiles are
     * excluded so a pickup never lands under a mob. Runs out of candidate tiles → places fewer items
     * (the floor is small / the plan is huge); an unknown id is skipped with a warning. No plan
     * (standalone/debug entry) → a bare floor, identical to the old behaviour.
     */
    #spawnLoot() {
        const plan = this.options.loot ?? [];
        if (plan.length === 0) return;

        // Candidate tiles = every walkable floor tile minus the mob spawn spots (player + enemies).
        const occupied = new Set(this.mobs.map(mob => this.#tileKey(mob.tile)));
        const candidates = this.level.floorTiles().filter(tile => !occupied.has(this.#tileKey(tile)));
        this.#shuffle(candidates);

        plan.forEach((id, index) => {
            const def = ITEMS[id];
            if (!def) {
                console.warn(`PixelDungeon: loot plan references unknown item id "${id}" — skipping`);
                return;
            }
            const tile = candidates[index];
            if (!tile) return; // ran out of distinct floor tiles — place what fits, drop the rest
            this.level.addItem(new PixelDungeonItem(this.scene, def), tile.x, tile.y);
        });
    }

    /** A stable `x,y` key for de-duplicating tiles in a Set (tile objects aren't value-equal). */
    #tileKey(tile: TileXYType): string {
        return `${tile.x},${tile.y}`;
    }

    /** In-place Fisher-Yates shuffle so loot lands on varied floor tiles each run, not a fixed prefix. */
    #shuffle<T>(items: T[]): void {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
    }

    /**
     * Collect an item the player stepped onto (RPG cluster A). Records its id on `#collectedLoot` (the
     * thing carried out in the result), removes the entity from the world, and shows a pickup floater on
     * the mob. The id is the only thing that escapes the scene — the entity is destroyed here, so nothing
     * leaks into np-state. Idempotent against a double-trigger: removing an already-removed item is safe,
     * but we still record once because the event/action both route through here exactly once per pickup.
     */
    collectItem(mob: PixelDungeonMob, item: PixelDungeonItem): void {
        this.#collectedLoot.push(item.def.id);
        this.level.removeItem(item);
        mob.info(item.def.label, EMobInfoType.GainHealth);
    }

    updateFoV() {
        const vision = this.player.vision;
        this.level.loseVision(vision.currentView);
        this.player.lookAround();
        this.level.gainVision(vision.currentView);
        this.mobs.forEach(mob => (mob.alpha = vision.canSee(mob.tile) ? 1 : 0.2));
    }

    /**
     * Refresh vision after a mob stepped (subscriber to 'mob:moved'). Only the player's move changes
     * the player's field of view (and thus tile lighting); an enemy's move can only change that
     * enemy's own visibility, so we skip the full recompute for enemies and just re-evaluate alpha.
     */
    #onMobMoved(mob: PixelDungeonMob) {
        if (mob === this.player) {
            this.updateFoV();
        } else {
            mob.alpha = this.player.vision.canSee(mob.tile) ? 1 : 0.2;
        }
    }

    /**
     * Kill a mob (Leet combat spine) — idempotent and desync-safe. The death-during-animation / ready-set
     * desync is the headline risk of this task (REVIEW weakness #9 / cluster B): a dead mob must vanish from
     * BOTH the engine roster (`this.mobs`) AND the active turn loop's private ready set, or the drain loop
     * NPEs on a corpse. The steps, in order:
     *  1. Idempotency guard: if it's already gone from `this.mobs`, return — so a kill racing a later check
     *     (e.g. an attack's onContact and the loop both noticing the same death) can't double-fire.
     *  2. Drop it from the engine roster.
     *  3. Scrub it from the turn loop's ready set (`HandleActionState.removeFromReady`) — the second list.
     *  4. Remove it from the board + play its death (level.removeMob), unblocking its tile for A*.
     *  5. Resolve win/lose through the FSM-owned `endGame`: the player dying fails the run; the last enemy
     *     dying completes it.
     */
    killMob(mob: PixelDungeonMob): void {
        if (!this.mobs.includes(mob)) return; // already dead — guards the double-call
        this.mobs = this.mobs.filter(m => m !== mob);
        this.#handleAction.removeFromReady(mob);
        this.level.removeMob(mob);

        if (mob === this.player) {
            // Lethal failure — loot is lost (roguelike convention), so it's omitted from the result.
            this.endGame({ kind: 'dungeon', outcome: 'failed' });
        } else if (this.mobs.every(m => m === this.player)) {
            // Victory: carry the collected loot out (RPG cluster A) — a copy so the result can't be
            // mutated through the engine's private array after the run.
            this.endGame({ kind: 'dungeon', outcome: 'completed', loot: [...this.#collectedLoot] });
        }
    }

    startUP() {
        this.goto(States.StartGame);
    }

    /**
     * The single API that ends a run (Leet F1). Later tasks (player death, objective complete) all call
     * this; today only the scene's demoted debug bail does. Records the outcome and routes through the FSM
     * to {@link EndGameState}, which reports it — so the FSM, not any caller, owns game-over. Guarded so a
     * second call (e.g. a debug bail racing a real exit) is a no-op rather than a double transition.
     */
    endGame(result: DungeonResult): void {
        if (this.#over) return;
        this.#over = true;
        this.#result = result;
        this.goto(States.EndGame);
    }

    /**
     * Hand the recorded outcome back to the run, exactly once (driven by {@link EndGameState} on enter).
     * The `#over` flag already guards a double `endGame`, but we null the result after firing as belt-and-
     * braces so a stray re-entry of EndGame can never re-report.
     */
    reportResult(): void {
        if (!this.#result) return;
        const result = this.#result;
        this.#result = undefined;
        this.options.onResult?.(result);
    }

    gainEnergy() {
        let canAct = false;
        this.mobs.forEach(mob => (canAct = mob.activity.gainEnergy() || canAct));
        return canAct;
    }

    startTurn() {
        this.#turn++;
        this.events.emit('turn:started', { turn: this.#turn });
        this.mobs.forEach(mob => mob.startTurn());
        this.level.doors(this.mobs);
    }

    displayText(msg: string, tile: TileXYType, type: EMobInfoType) {
        this.scene.add.existing(new PixelDungeonInfoText(this, tile, msg, type));
    }

    public movePlayer(targetTile: TileXYType) {
        const mob = this.level.getMobAt(targetTile);
        if (mob) {
            this.player.attack(mob as PixelDungeonMob);
        } else {
            const pathToMove = this.#pathfinder.findPath({ x: targetTile.x, y: targetTile.y });
            this.player.movement.moveOnPath(pathToMove);
        }
    }

    /**
     * Find a path for ANY mob to a target tile (RPG cluster E — enemy hunting). The single rex `PathFinder`
     * is rooted on the player (so `movePlayer` works); enemies reuse it by **re-rooting**: point it at the
     * mob, query, then immediately reset it back to the player. The re-root/reset bracket the one
     * `findPath` call tightly — we never cache a path or leave the pathfinder rooted on an enemy, so two
     * hunters can't read each other's stale root and `movePlayer` always finds it rooted on the player
     * again. The caller (the brain) takes only the FIRST step and re-paths next turn, so a path is never
     * stored across turns. Returns an empty array when no route exists (the brain then wanders).
     */
    public findPathFor(mob: PixelDungeonMob, targetTile: TileXYType): TileXYType[] {
        this.#pathfinder.setChess(mob);
        try {
            return this.#pathfinder.findPath({ x: targetTile.x, y: targetTile.y }) ?? [];
        } finally {
            // Always restore the player root, even if findPath throws, so movePlayer is never left broken.
            this.#pathfinder.setChess(this.player);
        }
    }

    get level() {
        return this.#level;
    }

    /** The typed engine event bus — the in-dungeon signal hub (see {@link PixelDungeonEvents}). */
    get events() {
        return this.#events;
    }
}
