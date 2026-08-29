import { NPRectangle, NPScene, NPText, NPTextButton } from '@shared/np-phaser';

import { GreyFight } from './core/grey-fight';
import {
    CAT_ROSTER,
    catDefForIndex,
    formatNumber,
    LocationSnapshot,
    TreeNode,
    TREES,
    TurnResult,
    UPGRADE_NODES,
} from './core/grey-fight.model';

/** What the app injects when opening the colony (run-conductor `beginColony`). */
export interface GreyFightSceneConfig {
    /** The persistent engine — kept by the conductor so progress survives leaving and reopening. */
    engine: GreyFight;
    /** Called when the player taps "← Back" to leave the colony. */
    onExit?: () => void;
}

/** Which page of the colony is showing. */
type View = 'fight' | 'upgrade';

/** A built node widget: its model, the clickable card, and the label drawn on it. */
interface NodeWidget {
    node: TreeNode;
    card: NPRectangle;
    label: NPText;
}

/** A built location chip: the model index, its background card, and the label drawn on it. */
interface LocationChip {
    index: number;
    card: NPRectangle;
    label: NPText;
}

/** A spawned grey cloud — a tap target inside the grey-mass. Charged (gold) clouds force a crit + bonus light. */
interface Cloud {
    rect: NPRectangle;
    charged: boolean;
}

const CARD_W = 200;
const CARD_H = 108;
/** Pointer travel (px) past which a press counts as a drag, not a node tap. */
const DRAG_THRESHOLD = 10;
/** Location chip geometry for the switcher row. */
const CHIP_W = 132;
const CHIP_H = 56;
const CHIP_GAP = 10;

/**
 * The grey-fight colony scene (GDD §4 "Holding the Grey", `docs/grey-fight/design.md`). Turn-based: progress
 * happens ONLY when the player takes a turn (a tap). There is no real-time loop — {@link update} merely drains
 * celebration events and repaints the HUD from a snapshot. Two pages:
 *  - **Fight** — the active location. A *contested* frontier is a grey-mass you tap to take a combat turn
 *    (you strike → cats strike → grey heals); a *reclaimed* home is a place you tap to take a cultivation
 *    turn (yield resource, advance colour tier) and where you can evolve its cat. A chip row switches the
 *    active location; a "Start round" button refills stamina when the round is over.
 *  - **Upgrades** — a draggable page laying out ONE connected skill tree that **unfolds** as you play: each
 *    node is shown only once {@link GreyFight.isRevealed} (its parent acquired). Upgrade nodes are bought with
 *    banked light; the six cat gate nodes are not buyable — they auto-acquire when their cat is freed in
 *    combat, opening the branch behind them. Pan the page and tap upgrade nodes to buy.
 * Renders a {@link GreyFight} engine; owns no game logic.
 */
export class GreyFightScene extends NPScene {
    static key = 'grey-fight-scene';
    readonly #engine: GreyFight;
    readonly #onExit?: () => void;

    #view: View = 'fight';
    /** Set once create() has built every widget — guards update() from touching them before they exist. */
    #built = false;

    // Layers (containers). Fight + overlay are static; the tree page is dragged to pan.
    #fightLayer!: Phaser.GameObjects.Container;
    #upgradeBg!: NPRectangle;
    #treeLayer!: Phaser.GameObjects.Container;
    #links!: Phaser.GameObjects.Graphics;
    #upgradeOverlay!: Phaser.GameObjects.Container;

    // Fight widgets.
    #subtitle!: NPText;
    #greyRect!: NPRectangle;
    #greyLabel!: NPText;
    #hpFill!: NPRectangle;
    #hpText!: NPText;
    #lightText!: NPText;
    #roundText!: NPText;
    #breakdownText!: NPText;
    #statsText!: NPText;
    #catGateText!: NPText;
    #startBtn!: NPTextButton;
    #evolveBtn!: NPTextButton;

    // Grey clouds — the tap targets that spawn (real time) inside the grey-mass while a round is live.
    #cloudLayer!: Phaser.GameObjects.Container;
    readonly #clouds: Cloud[] = [];
    #spawnAccum = 0;

    // Location switcher (rebuilt as the colony grows).
    #chipRow!: Phaser.GameObjects.Container;
    readonly #chips: LocationChip[] = [];
    #renderedLocations = 0;

    // The freed-cat ship strip (grows with the roster).
    #renderedCats = 0;

    // Upgrade widgets.
    readonly #nodeWidgets: NodeWidget[] = [];
    #upLightText!: NPText;

    // Drag state for panning the tree page.
    #dragging = false;
    #dragLastX = 0;
    #dragLastY = 0;
    #dragOriginX = 0;
    #dragOriginY = 0;
    #dragMoved = 0;
    #minX = 0;
    #maxX = 0;
    #minY = 0;
    #maxY = 0;

    // Layout, resolved from the live canvas size in create().
    #cx = 0;
    #greyCy = 0;
    #greyW = 0;
    #greyH = 0;

    constructor(config: GreyFightSceneConfig) {
        super({ key: GreyFightScene.key });
        this.#engine = config.engine;
        this.#onExit = config.onExit;
    }

    setupComponents(): void {
        // Plain text + shapes built in create(); nothing to preload.
    }

    override create(): void {
        super.create();
        // Discard any events the persistent engine queued before this (freshly rebuilt) scene existed, so the
        // first update() has nothing to act on pre-build and we don't replay stale celebrations.
        this.#engine.drainEvents();
        this.#buildFightLayer();
        this.#buildUpgradePage();
        this.#wireDrag();
        this.events.once('shutdown', () => this.input.removeAllListeners());
        this.#showView('fight');
        this.#refreshFight();
        this.#built = true;
    }

    // --- Fight page -------------------------------------------------------------------------------

    #buildFightLayer(): void {
        const { width, height } = this.scale.gameSize;
        this.#cx = width / 2;
        this.#greyCy = height * 0.46;
        this.#greyW = Math.min(560, width * 0.5);
        this.#greyH = Math.min(320, height * 0.36);

        const layer = this.add.container(0, 0);
        this.#fightLayer = layer;

        this.#in(layer, new NPRectangle(this, this.#cx, height / 2, width, height, 0x0a0c12).setOrigin(0.5));
        this.#in(layer, new NPText(this, this.#cx, 48, 'Holding the Grey', { fontSize: '44px', color: '#cfe8ff' }).setOrigin(0.5)); // prettier-ignore
        this.#subtitle = this.#in(layer, new NPText(this, this.#cx, 92, '', { fontSize: '22px', color: '#7fa6c4' }).setOrigin(0.5)); // prettier-ignore

        const back = new NPTextButton(this, 60, 44, '← Back', { fontSize: '26px', color: '#0f0' });
        back.on('pointerup', () => this.#onExit?.());
        this.#in(layer, back);

        const upgrades = new NPTextButton(this, width - 60, 44, '⚙ Upgrades', { fontSize: '26px', color: '#0f0' });
        upgrades.setOrigin(1, 0.5);
        upgrades.on('pointerup', () => this.#showView('upgrade'));
        this.#in(layer, upgrades);

        // Location switcher row (chips built lazily by #syncChips as the colony grows).
        this.#chipRow = this.add.container(0, 132);
        layer.add(this.#chipRow);

        // The grey-mass is now a BACKDROP (alpha tracks fill); you tap the grey CLOUDS that spawn on top of it.
        this.#greyRect = this.#in(layer, new NPRectangle(this, this.#cx, this.#greyCy, this.#greyW, this.#greyH, 0x9aa3ad).setOrigin(0.5)); // prettier-ignore
        // Clouds spawn into this layer — above the backdrop, below the centre hint label.
        this.#cloudLayer = this.add.container(0, 0);
        layer.add(this.#cloudLayer);
        this.#greyLabel = this.#in(layer, new NPText(this, this.#cx, this.#greyCy, '', { fontSize: '28px', color: '#05070d', align: 'center' }).setOrigin(0.5)); // prettier-ignore

        // Fight bar (contested: grey HP; reclaimed: hidden) + a numeric readout above it.
        const barY = this.#greyCy + this.#greyH / 2 + 36;
        this.#hpText = this.#in(layer, new NPText(this, this.#cx, barY - 24, '', { fontSize: '18px', color: '#9fb2c4' }).setOrigin(0.5)); // prettier-ignore
        this.#in(layer, new NPRectangle(this, this.#cx, barY, this.#greyW, 22, 0x1a1f2b).setOrigin(0.5));
        this.#hpFill = this.#in(layer, new NPRectangle(this, this.#cx - this.#greyW / 2, barY, this.#greyW, 22, 0xaab3bf).setOrigin(0, 0.5)); // prettier-ignore

        // Plain, legible HUD labels (the old one-liner was too dense): round budget, the per-turn breakdown,
        // the cat gate, and the persistent light bank.
        this.#roundText = this.#in(layer, new NPText(this, this.#cx, barY + 36, '', { fontSize: '24px', color: '#dff1ff' }).setOrigin(0.5)); // prettier-ignore
        this.#breakdownText = this.#in(layer, new NPText(this, this.#cx, barY + 70, '', { fontSize: '20px', color: '#9fb2c4', align: 'center' }).setOrigin(0.5)); // prettier-ignore
        this.#statsText = this.#in(layer, new NPText(this, this.#cx, barY + 104, '', { fontSize: '18px', color: '#7fa6c4', align: 'center' }).setOrigin(0.5)); // prettier-ignore
        this.#catGateText = this.#in(layer, new NPText(this, this.#cx, barY + 134, '', { fontSize: '18px', color: '#ffd9a8' }).setOrigin(0.5)); // prettier-ignore
        this.#lightText = this.#in(layer, new NPText(this, this.#cx, barY + 164, '', { fontSize: '26px', color: '#ffe9a8' }).setOrigin(0.5)); // prettier-ignore

        // "Start round" — shown only when the round is over. Sits over the grey-mass.
        this.#startBtn = new NPTextButton(this, this.#cx, this.#greyCy + this.#greyH / 2 + 4, '▶ Start round', { fontSize: '30px', color: '#0f0' }); // prettier-ignore
        this.#startBtn.setOrigin(0.5);
        this.#startBtn.on('pointerup', () => {
            this.#engine.startRound();
            this.#clearClouds();
            this.#refreshFight();
        });
        this.#in(layer, this.#startBtn);

        // "Evolve {cat}" — shown only at a reclaimed home, funded by that location's resource.
        this.#evolveBtn = new NPTextButton(this, this.#cx, this.#greyCy + this.#greyH / 2 + 4, '', { fontSize: '26px', color: '#0f0' }); // prettier-ignore
        this.#evolveBtn.setOrigin(0.5);
        this.#evolveBtn.on('pointerup', () => this.#handleEvolve());
        this.#in(layer, this.#evolveBtn);
    }

    // --- Grey clouds (the tap targets) -----------------------------------------------------------

    /**
     * Spawn grey clouds in real time inside the grey-mass while a fight round is live; clear them otherwise.
     * The clouds are the only real-time element — the economy stays turn-based: nothing damages/progresses
     * without a tap, and nothing accrues while you're away, so waiting is never rewarded (anti-Hush holds).
     */
    #updateClouds(deltaMs: number): void {
        const s = this.#engine.snapshot();
        if (this.#view !== 'fight' || s.isRoundOver) {
            if (this.#clouds.length) this.#clearClouds();
            return;
        }
        this.#spawnAccum += (deltaMs / 1000) * this.#engine.spawnRate;
        while (this.#spawnAccum >= 1 && this.#clouds.length < this.#engine.maxClouds) {
            this.#spawnAccum -= 1;
            this.#spawnCloud(s.activePhase === 'contested');
        }
    }

    /** Add one tappable cloud at a random spot inside the grey-mass; contested clouds may be charged (gold). */
    #spawnCloud(contested: boolean): void {
        const r = Math.max(18, this.#engine.hitRadius);
        const x = this.#cx + rand(-(this.#greyW / 2 - r / 2), this.#greyW / 2 - r / 2);
        const y = this.#greyCy + rand(-(this.#greyH / 2 - r / 2), this.#greyH / 2 - r / 2);
        const charged = contested && Math.random() < this.#engine.chargedChance;
        const color = charged ? 0xffd34d : contested ? 0xb8c0cc : 0x8fd9a0;
        const rect = new NPRectangle(this, x, y, r, r, color).setOrigin(0.5);
        rect.setStrokeStyle(2, charged ? 0xfff0b0 : 0x05070d);
        rect.setInteractive({ useHandCursor: true });
        const cloud: Cloud = { rect, charged };
        rect.on('pointerdown', () => this.#popCloud(cloud));
        this.#cloudLayer.add(rect);
        this.#clouds.push(cloud);
    }

    /** Pop a cloud → take ONE turn (charged clouds force a crit + bonus light) and float its result. */
    #popCloud(cloud: Cloud): void {
        if (this.#view !== 'fight') return;
        const x = cloud.rect.x;
        const y = cloud.rect.y;
        this.#removeCloud(cloud);
        const result = this.#engine.takeTurn({ charged: cloud.charged });
        if (result.kind === 'none') return; // round ended between spawn and tap
        this.#showTurnResult(result, x, y);
        this.#refreshFight();
    }

    /** Remove a cloud from the live set with a quick pop tween. */
    #removeCloud(cloud: Cloud): void {
        const i = this.#clouds.indexOf(cloud);
        if (i >= 0) this.#clouds.splice(i, 1);
        this.tweens.add({ targets: cloud.rect, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 110, onComplete: () => cloud.rect.destroy() }); // prettier-ignore
    }

    /** Destroy every live cloud (round over, view switch, or location switch). */
    #clearClouds(): void {
        for (const cloud of this.#clouds) cloud.rect.destroy();
        this.#clouds.length = 0;
        this.#spawnAccum = 0;
    }

    /** Float the popped cloud's outcome at its position (CRIT / BURST / CHARGED splash, or cultivation yield). */
    #showTurnResult(result: TurnResult, x: number, y: number): void {
        if (result.kind === 'combat') {
            const prefix = result.charged ? 'CHARGED ' : result.crit ? 'CRIT ' : result.burst ? 'BURST ' : '';
            const color = result.charged ? '#ffd34d' : result.burst ? '#a6f0ff' : result.crit ? '#ffe08a' : '#dff1ff'; // prettier-ignore
            const size = result.burst || result.charged ? '46px' : result.crit ? '40px' : '30px';
            this.#floatText(`${prefix}-${formatNumber(result.tapDamage)}`, x, y - 20, color, size);
            if (result.burst) {
                const cometName = this.#engine.snapshot().cats.find(c => c.ability === 'burst')?.name ?? 'Comet';
                this.#flash(`✦ ${cometName} bursts! ✦`);
            }
        } else if (result.kind === 'cultivate') {
            this.#floatText(`+${formatNumber(result.resourceGained)} resource`, x, y, '#9be37b', '28px');
        }
    }

    /** Evolve the active reclaimed location's cat with its banked resource (no-op if it can't). */
    #handleEvolve(): void {
        const s = this.#engine.snapshot();
        const loc = s.locations[s.activeLocationIndex];
        if (!loc || s.activePhase !== 'reclaimed') return;
        if (this.#engine.evolveCat(loc.catId)) this.#refreshFight();
    }

    /** Repaint the fight HUD from the engine snapshot. */
    #refreshFight(): void {
        const s = this.#engine.snapshot();
        const loc = s.locations[s.activeLocationIndex];
        const contested = s.activePhase === 'contested';
        const catName = catNameFor(s, loc);

        this.#syncChips();
        this.#refreshChips();
        this.#syncStrip();

        this.#subtitle.setText(`${s.cats.length - 1} cats freed · ${s.locations.length} locations · best round ${formatNumber(s.bestRoundDamage)}`); // prettier-ignore

        if (contested) {
            // --- Fighting a contested frontier -----------------------------------------------------
            const phase = s.phase === 'boss' ? 'BOSS-MASS' : 'grey-mass';
            const frac = clamp01(s.greyMax > 0 ? s.greyHp / s.greyMax : 0);
            this.#greyRect.setVisible(true);
            this.#greyRect.setAlpha(0.25 + 0.7 * frac);
            this.#greyRect.setFillStyle(s.phase === 'boss' ? 0x6b7280 : 0x9aa3ad);
            this.#greyLabel.setText(`${catName}'s den\nbay ${s.bay + 1} · ${phase}\n${s.isRoundOver ? '' : 'tap the clouds'}`); // prettier-ignore
            this.#hpFill.setVisible(true);
            this.#hpFill.scaleX = frac;
            this.#hpText.setVisible(true);
            this.#hpText.setText(`grey ${formatNumber(Math.max(0, s.greyHp))} / ${formatNumber(s.greyMax)}`);

            const net = s.netPerTurn;
            this.#roundText.setText(`Round: stamina ${s.stamina} / ${s.maxStamina}  ·  this round ${formatNumber(s.roundDamage)}`); // prettier-ignore
            this.#breakdownText.setText(`per turn → you ${formatNumber(s.tapDamage)}  +  cats ${formatNumber(s.catStrike)}  −  heal ${formatNumber(s.regenPerTurn)}  =  net ${net >= 0 ? '+' : ''}${formatNumber(net)}`); // prettier-ignore
            this.#statsText.setText(`crit ${Math.round(s.critChance * 100)}% ×${formatNumber(s.critMult)}  ·  best round ${formatNumber(s.bestRoundDamage)}`); // prettier-ignore
            this.#catGateText.setText(`Free ${s.nextCatName} at ${formatNumber(s.nextCatThreshold)} round dmg`);
            this.#catGateText.setVisible(true);
            this.#evolveBtn.setVisible(false);
        } else {
            // --- Cultivating a reclaimed home -------------------------------------------------------
            this.#greyRect.setVisible(true);
            this.#greyRect.setAlpha(0.9);
            this.#greyRect.setFillStyle(loc ? colorTierFill(loc) : 0x3a4a3a);
            this.#greyLabel.setText(`${catName}'s home\ncolour tier ${loc?.colorTier ?? 0}\n${s.isRoundOver ? '' : 'tap the motes'}`); // prettier-ignore
            this.#hpFill.setVisible(false);
            this.#hpText.setVisible(true);
            this.#hpText.setText(`resource ${formatNumber(loc?.resource ?? 0)}`);

            this.#roundText.setText(`Round: stamina ${s.stamina} / ${s.maxStamina}`);
            this.#breakdownText.setText(`per turn → +${formatNumber((s.tapDamage + s.catStrike) * 0.5)} resource (cultivation)`); // prettier-ignore
            this.#statsText.setText(`colour tier ${loc?.colorTier ?? 0}  ·  resource ${formatNumber(loc?.resource ?? 0)}`); // prettier-ignore
            this.#catGateText.setVisible(false);

            // Evolve button (hidden while a round is in progress so it doesn't overlap "tap to cultivate").
            const cost = loc ? this.#engine.evolveCost(loc.catId) : 0;
            const can = loc ? this.#engine.canEvolve(loc.catId) : false;
            const evoLevel = loc ? this.#engine.catEvoLevel(loc.catId) : 0;
            this.#evolveBtn.setVisible(s.isRoundOver && !!loc);
            this.#evolveBtn.setText(`✦ Evolve ${catName} (Lv ${evoLevel}) — ${formatNumber(cost)} resource`);
            this.#evolveBtn.setAlpha(can ? 1 : 0.5);
        }

        this.#lightText.setText(`✦ Light ${formatNumber(s.light)}`);
        this.#startBtn.setVisible(s.isRoundOver);
        // When the round is over and we're contested, the evolve button is hidden; the start button shows.
        if (s.isRoundOver && contested) this.#evolveBtn.setVisible(false);
    }

    // --- Location switcher ------------------------------------------------------------------------

    /** Build a chip per location once, growing the row as the colony opens new locations. */
    #syncChips(): void {
        const locations = this.#engine.snapshot().locations;
        if (locations.length === this.#renderedLocations) return;

        for (let i = this.#renderedLocations; i < locations.length; i++) {
            const card = new NPRectangle(this, 0, 0, CHIP_W, CHIP_H, 0x141a26).setOrigin(0.5);
            card.setStrokeStyle(2, 0x33415a);
            card.setInteractive({ useHandCursor: true });
            const index = i;
            card.on('pointerup', () => {
                const s = this.#engine.snapshot();
                // Re-tapping the location you're already on mid-round must not wipe its in-progress fight.
                if (index === s.activeLocationIndex && !s.isRoundOver) return;
                this.#engine.setActiveLocation(index);
                this.#engine.startRound();
                this.#clearClouds();
                this.#refreshFight();
            });
            const label = new NPText(this, 0, 0, '', { fontSize: '15px', color: '#cfe8ff', align: 'center' }).setOrigin(0.5); // prettier-ignore
            this.#chipRow.add(card);
            this.#chipRow.add(label);
            this.#chips.push({ index, card, label });
        }
        this.#renderedLocations = locations.length;

        // Re-centre the row for the new count.
        const total = this.#chips.length * CHIP_W + (this.#chips.length - 1) * CHIP_GAP;
        let x = this.#cx - total / 2 + CHIP_W / 2;
        for (const chip of this.#chips) {
            chip.card.setPosition(x, 0);
            chip.label.setPosition(x, 0);
            x += CHIP_W + CHIP_GAP;
        }
    }

    /** Repaint each chip: name, phase, and whether it's the active location. */
    #refreshChips(): void {
        const s = this.#engine.snapshot();
        for (const chip of this.#chips) {
            const loc = s.locations[chip.index];
            if (!loc) continue;
            const active = chip.index === s.activeLocationIndex;
            const tag = loc.phase === 'contested' ? '⚔ frontier' : '🏠 home';
            const catColor = s.cats.find(c => c.id === loc.catId)?.color ?? 0x33415a;
            chip.label.setText(`${catNameFor(s, loc)}\n${tag}`);
            chip.card.setFillStyle(active ? 0x1b2740 : 0x141a26);
            chip.card.setStrokeStyle(active ? 3 : 2, active ? 0x66e08a : catColor);
        }
    }

    /**
     * Grow the bottom ship-strip when the freed-cat roster grows: one colored cell per cat, its name, and a
     * tiny second line surfacing the cat's signature-ability blurb (wider cells than before so the blurb fits).
     */
    #syncStrip(): void {
        const cats = this.#engine.snapshot().cats;
        if (cats.length === this.#renderedCats) return;
        this.#renderedCats = cats.length;
        const { width, height } = this.scale.gameSize;
        const cellW = 116;
        const gap = 10;
        const totalW = cats.length * cellW + (cats.length - 1) * gap;
        const y = height - 60;
        let x = width / 2 - totalW / 2 + cellW / 2;
        for (const cat of cats) {
            this.#in(this.#fightLayer, new NPRectangle(this, x, y, cellW, 30, cat.color).setOrigin(0.5));
            this.#in(this.#fightLayer, new NPText(this, x, y + 26, cat.name, { fontSize: '13px', color: '#cfe8ff' }).setOrigin(0.5)); // prettier-ignore
            this.#in(this.#fightLayer, new NPText(this, x, y + 42, cat.blurb, { fontSize: '10px', color: '#7fa6c4', align: 'center', wordWrap: { width: cellW } }).setOrigin(0.5, 0)); // prettier-ignore
            x += cellW + gap;
        }
    }

    // --- Upgrade page -----------------------------------------------------------------------------

    #buildUpgradePage(): void {
        const { width, height } = this.scale.gameSize;

        this.#upgradeBg = new NPRectangle(this, this.#cx, height / 2, width, height, 0x070a10).setOrigin(0.5);
        this.addExisting(this.#upgradeBg);

        const tree = this.add.container(0, 0);
        this.#treeLayer = tree;

        // Parent→child links, drawn behind the cards (redrawn each refresh; the field holds the graphics).
        this.#links = this.add.graphics();
        tree.add(this.#links);

        // One title for the whole connected tree (no more per-column headings).
        const rootNode = UPGRADE_NODES.find(n => !n.requires);
        tree.add(new NPText(this, rootNode?.x ?? 0, (rootNode?.y ?? 120) - 110, 'Skill Tree', { fontSize: '36px', color: '#cfe8ff' }).setOrigin(0.5)); // prettier-ignore

        // Node cards, across the whole tree. Cat nodes are gates (no buy on tap); upgrades buy on tap.
        for (const node of UPGRADE_NODES) {
            const card = new NPRectangle(this, node.x, node.y, CARD_W, CARD_H, 0x141a26).setOrigin(0.5);
            card.setStrokeStyle(2, nodeColor(node));
            card.setInteractive({ useHandCursor: true });
            card.on('pointerup', () => {
                if (node.kind !== 'upgrade') return; // cat gates auto-acquire in combat — never buyable
                if (this.#view === 'upgrade' && this.#dragMoved <= DRAG_THRESHOLD && this.#engine.buy(node.id)) {
                    this.#refreshTree();
                }
            });
            const label = new NPText(this, node.x, node.y, '', { fontSize: '16px', color: '#e8eef5', align: 'center' });
            label.setOrigin(0.5);
            tree.add(card);
            tree.add(label);
            this.#nodeWidgets.push({ node, card, label });
        }

        this.#computeDragBounds();
        // Start panned so the root (top-centre) is visible: centre the root's x, pin the top.
        tree.x = clamp(this.#cx - (rootNode?.x ?? 0), this.#minX, this.#maxX);
        tree.y = clamp(this.#maxY, this.#minY, this.#maxY); // #maxY is the top-pinned bound (#minY pins the bottom)

        // Fixed overlay: return button, the live Light readout, and a hint.
        const overlay = this.add.container(0, 0);
        this.#upgradeOverlay = overlay;
        const fightBtn = new NPTextButton(this, 60, 44, '← Fight', { fontSize: '26px', color: '#0f0' });
        fightBtn.on('pointerup', () => this.#showView('fight'));
        overlay.add(fightBtn);
        this.#upLightText = new NPText(this, this.#cx, 44, '', { fontSize: '30px', color: '#ffe9a8' }).setOrigin(0.5);
        overlay.add(this.#upLightText);
        overlay.add(
            new NPText(this, this.#cx, height - 36, 'drag to pan · tap a node to buy', {
                fontSize: '18px',
                color: '#5d6b7e',
            }).setOrigin(0.5)
        );
    }

    /** Redraw a parent→child line for every link whose BOTH endpoints are revealed (no dangling lines). */
    #drawLinks(): void {
        this.#links.clear();
        this.#links.lineStyle(3, 0x33415a);
        for (const node of UPGRADE_NODES) {
            if (!node.requires) continue;
            if (!this.#engine.isRevealed(node.id)) continue; // child hidden ⇒ parent not yet acquired
            const parent = UPGRADE_NODES.find(n => n.id === node.requires);
            if (parent) this.#links.lineBetween(parent.x, parent.y, node.x, node.y);
        }
    }

    /**
     * Repaint the whole tree from engine state and **unfold** it: each node is visible only when revealed.
     * Upgrade nodes show name/desc/Lv/cost with locked / affordable / owned / maxed colouring; cat gate nodes
     * are tinted in the cat's colour and read as `✓ freed` or `🔒 free it in combat` (never buyable).
     */
    #refreshTree(): void {
        this.#upLightText.setText(`✦ Light ${formatNumber(this.#engine.snapshot().light)}`);
        this.#drawLinks();
        const freedIds = new Set(this.#engine.snapshot().cats.map(c => c.id));
        for (const { node, card, label } of this.#nodeWidgets) {
            const revealed = this.#engine.isRevealed(node.id);
            card.setVisible(revealed);
            label.setVisible(revealed);
            if (!revealed) continue;

            if (node.kind === 'cat') {
                const freed = freedIds.has(node.catId);
                label.setText(`${node.name}\n${node.desc}\n${freed ? '✓ freed' : '🔒 free it in combat'}`);
                label.setColor('#e8eef5');
                card.setFillStyle(freed ? 0x1b2740 : 0x141a26);
                card.setStrokeStyle(3, nodeColor(node));
                card.setAlpha(freed ? 1 : 0.7);
                continue;
            }

            const level = this.#engine.nodeLevel(node.id);
            const maxed = this.#engine.isMaxed(node.id);
            const afford = this.#engine.canAfford(node.id);
            const state = maxed ? 'MAX' : `${formatNumber(this.#engine.costFor(node.id))} ✦`;
            label.setText(`${node.name}\n${node.desc}\nLv ${level}/${node.maxLevel}\n${state}`);
            label.setColor('#e8eef5');
            card.setFillStyle(level > 0 ? 0x1b2740 : 0x141a26);
            card.setStrokeStyle(2, maxed ? 0x66e08a : nodeColor(node));
            card.setAlpha(maxed || afford ? 1 : 0.6);
        }
    }

    #computeDragBounds(): void {
        const { width, height } = this.scale.gameSize;
        const pad = 140;
        const xs = UPGRADE_NODES.map(n => n.x);
        const ys = UPGRADE_NODES.map(n => n.y);
        const left = Math.min(...xs) - CARD_W / 2 - pad;
        const right = Math.max(...xs) + CARD_W / 2 + pad;
        const top = Math.min(...ys) - CARD_H - pad;
        const bottom = Math.max(...ys) + CARD_H / 2 + pad;
        this.#maxX = -left;
        this.#minX = Math.min(this.#maxX, width - right);
        this.#maxY = -top;
        this.#minY = Math.min(this.#maxY, height - bottom);
    }

    #wireDrag(): void {
        this.input.on('pointerdown', (pointer: { x: number; y: number }) => {
            if (this.#view !== 'upgrade') return;
            this.#dragging = true;
            this.#dragLastX = pointer.x;
            this.#dragLastY = pointer.y;
            this.#dragOriginX = pointer.x;
            this.#dragOriginY = pointer.y;
            this.#dragMoved = 0;
        });
        this.input.on('pointermove', (pointer: { x: number; y: number; isDown: boolean }) => {
            if (!this.#dragging || !pointer.isDown) return;
            const dx = pointer.x - this.#dragLastX;
            const dy = pointer.y - this.#dragLastY;
            this.#dragLastX = pointer.x;
            this.#dragLastY = pointer.y;
            // Threshold on straight-line distance from the press origin — summing Manhattan deltas overcounts
            // finger jitter and would eat legitimate node taps on touch.
            this.#dragMoved = Math.max(this.#dragMoved, Math.hypot(pointer.x - this.#dragOriginX, pointer.y - this.#dragOriginY)); // prettier-ignore
            this.#treeLayer.x = clamp(this.#treeLayer.x + dx, this.#minX, this.#maxX);
            this.#treeLayer.y = clamp(this.#treeLayer.y + dy, this.#minY, this.#maxY);
        });
        this.input.on('pointerup', () => {
            this.#dragging = false;
        });
    }

    #showView(view: View): void {
        this.#view = view;
        const upgrade = view === 'upgrade';
        this.#fightLayer.setVisible(!upgrade);
        this.#upgradeBg.setVisible(upgrade);
        this.#treeLayer.setVisible(upgrade);
        this.#upgradeOverlay.setVisible(upgrade);
        if (upgrade) this.#refreshTree();
        else this.#refreshFight();
    }

    // --- Loop -------------------------------------------------------------------------------------

    /**
     * No real-time tick — this is a TURN-BASED game (the old `engine.tick(dt)` is gone). Turns are taken on
     * taps in {@link #handleTap}; here we only drain the engine's celebration events and keep the live light
     * readout fresh. The HUD otherwise repaints reactively on each tap/button.
     */
    override update(time: number, delta: number): void {
        super.update(time, delta);
        if (!this.#built) return; // Phaser can step a scene before create() finishes building widgets.
        let touchedFight = false;
        for (const event of this.#engine.drainEvents()) {
            switch (event.kind) {
                case 'freedCat':
                    this.#flash(`✦ Freed ${event.cat.name}! ✦`);
                    touchedFight = true;
                    break;
                case 'reclaimedLocation':
                    this.#flash('A den is reclaimed!');
                    break;
                case 'openedLocation':
                    this.#flash('A new location opens!');
                    touchedFight = true;
                    break;
                case 'colorTierUp':
                    this.#flash(`Colour tier ${event.tier}!`);
                    break;
                case 'catEvolved':
                    this.#flash(`Evolved to Lv ${event.level}!`);
                    break;
                case 'enteredBoss':
                    this.#flash('A boss-mass condenses!');
                    break;
                case 'roundOver':
                    this.#flash('Round over — spend light, then start the next.');
                    touchedFight = true;
                    break;
            }
        }
        // Repaint when an event changed visible state (roster/locations/round) while on the fight page.
        if (touchedFight && this.#view === 'fight') this.#refreshFight();
        // Keep the upgrade page's light readout live so a freed-cat/roundOver bank shows immediately.
        if (this.#view === 'upgrade') {
            this.#upLightText.setText(`✦ Light ${formatNumber(this.#engine.snapshot().light)}`);
        }
        // The one real-time element: spawn / clear the grey clouds (tap targets). Economy stays turn-based.
        this.#updateClouds(delta);
    }

    // --- Helpers ----------------------------------------------------------------------------------

    #flash(message: string): void {
        const { height } = this.scale.gameSize;
        this.#floatText(message, this.#cx, height * 0.24, '#ffffff', '40px', 1400, 80);
    }

    #floatText(text: string, x: number, y: number, color: string, size = '32px', duration = 700, rise = 120): void {
        const label = new NPText(this, x, y, text, { fontSize: size, color }).setOrigin(0.5);
        this.addExisting(label);
        this.tweens.add({ targets: label, y: y - rise, alpha: 0, duration, onComplete: () => label.destroy() });
    }

    /** Add an object to a layer container and return it (typed), so fields can be assigned inline. */
    #in<T extends NPText | NPRectangle | NPTextButton>(layer: Phaser.GameObjects.Container, obj: T): T {
        layer.add(obj);
        return obj;
    }
}

/**
 * The display name of the cat a location houses. A reclaimed home's cat is freed (in `cats`); a contested
 * frontier's cat is not yet freed, so fall back to its roster name via the model's {@link catDefForIndex}.
 */
function catNameFor(snapshot: { cats: { id: string; name: string }[] }, loc?: LocationSnapshot): string {
    if (!loc) return 'the colony';
    return snapshot.cats.find(c => c.id === loc.catId)?.name ?? catDefForIndex(loc.index).name;
}

/** A reclaimed home's fill tint, deepening (greyer → greener) with its colour tier. */
function colorTierFill(loc: LocationSnapshot): number {
    const g = Math.min(0xff, 0x60 + loc.colorTier * 0x12);
    return (0x20 << 16) | (g << 8) | 0x30;
}

/** A node's accent color, as a Phaser int: a cat node uses the cat's colour, an upgrade its family's. */
function nodeColor(node: TreeNode): number {
    if (node.kind === 'cat') return CAT_ROSTER.find(c => c.id === node.catId)?.color ?? 0xffffff;
    return TREES.find(t => t.id === node.tree)?.color ?? 0xffffff;
}

/** Clamp to [0, 1]. */
function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

/** Clamp to [lo, hi]. */
function clamp(value: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, value));
}

/** A random float in [lo, hi). */
function rand(lo: number, hi: number): number {
    return lo + Math.random() * (hi - lo);
}
