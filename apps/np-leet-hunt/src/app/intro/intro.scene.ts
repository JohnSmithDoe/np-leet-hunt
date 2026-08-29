import { INTRO_CRAWL } from '@shared/np-config';
import { centeredText, NPScene, NPText, npText } from '@shared/np-phaser';
import { PerspectiveRenderTexture } from 'phaser4-rex-plugins/plugins/perspectiveimage';

export interface IntroSceneOptions {
    /** Called once the crawl finishes scrolling or the player skips. Must be idempotent. */
    onDone: () => void;
}

const GOLD = '#ffd75a';
const SKY_BLUE = '#66ccff';

// --- Tunable look/feel (best dialled in with the app running) ---
const TILT_DEG = 58; // how far the crawl plane leans away; flip the sign if it tilts toward you
const PLANE_CENTRE_Y = 0.62; // crawl-plane centre, as a fraction of screen height
const RT_WIDTH = 1536; // crawl render-texture size (the text plane, in texture px)
const RT_HEIGHT = 1152;
const CRAWL_SECONDS = 38; // time for the whole story to scroll up the plane
const CRAWL_DELAY_MS = 2000; // wait before the crawl starts rising (logo is mid-recede by then)

/**
 * The one-time opening crawl, as a Phaser scene (Leet: intro). Three beats, like the Star Wars open:
 * a blue line fades in and out, the **LEET HUNT** logo snaps in huge and recedes to a point, and the
 * story scrolls up a backward-tilted plane into the distance.
 *
 * The receding plane is real 3D: the story text is drawn into a rex {@link PerspectiveRenderTexture}
 * (a `Phaser.GameObjects.Mesh` whose texture we own) and the whole mesh is tilted with `setAngleX`, so
 * the far edge genuinely foreshortens — not a fronto-parallel zoom. Each frame {@link update} clears the
 * render-texture and redraws the (off-display) crawl text at a scrolling offset, so it climbs the plane;
 * the logo + opening line stay flat, facing the viewer. Built in {@link create}; needs no assets.
 *
 * The conductor builds this scene on the title-screen audio choice and wires {@link IntroSceneOptions.onDone}
 * to the `intro → hangar` run-FSM transition; a click/tap/key skips straight there.
 */
export class IntroScene extends NPScene {
    static readonly key = 'intro';

    readonly #opts: IntroSceneOptions;
    #plane?: PerspectiveRenderTexture;
    #crawlText?: NPText;
    #startMs = 0;
    #finished = false;

    constructor(opts: IntroSceneOptions) {
        super({ key: IntroScene.key });
        this.#opts = opts;
    }

    setupComponents(): void {
        // Nothing to preload — the crawl is plain text + a drawn starfield, built in create().
    }

    override create(): void {
        super.create();
        const { width, height } = this.scale.gameSize;
        this.#startMs = this.time.now;

        this.#paintStarfield(width, height);
        this.#buildCrawlPlane(width, height);
        this.#paintDistanceFade(width, height);
        this.#buildLogo(width, height);
        this.#buildOpeningLine(width, height);

        // Click / tap / key anywhere → skip to the hangar.
        this.input.once('pointerdown', () => this.#finish());
        this.input.keyboard?.once('keydown', () => this.#finish());

        npText(this, width - 24, height - 24, 'click to skip', {
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#7fa6c4',
        })
            .setOrigin(1, 1)
            .setDepth(40)
            .setAlpha(0.7);
    }

    override update(): void {
        if (this.#finished || !this.#plane || !this.#crawlText) return;

        // Scroll the text up the plane: from just below the near (bottom) edge to past the far (top) edge.
        const travel = RT_HEIGHT + this.#crawlText.height;
        const progress = Math.max(0, this.time.now - this.#startMs - CRAWL_DELAY_MS) / 1000 / CRAWL_SECONDS;
        const scrollY = Math.round(RT_HEIGHT - progress * travel); // whole pixels — no sub-pixel shimmer

        // Phaser 4's DynamicTexture.draw() is deferred — it only commits once render() is called (rex's own
        // snapshot does draw().render()). Without the flush the mesh sampled an empty texture → nothing
        // showed. Clear, draw the scrolled text, then render so the mesh picks it up. (rex mistypes `rt` as
        // a RenderTexture, but it's a DynamicTexture at runtime — cast to reach clear/draw/render.)
        const rt = this.#plane.rt as unknown as Phaser.Textures.DynamicTexture;
        rt.clear();
        rt.draw(this.#crawlText, RT_WIDTH / 2, scrollY);
        rt.render();

        if (progress >= 1) this.#finish();
    }

    /** A black sky with a faint sprinkle of stars behind the crawl. */
    #paintStarfield(width: number, height: number): void {
        this.add
            .rectangle(width / 2, height / 2, width, height, 0x000000)
            .setOrigin(0.5)
            .setDepth(-1);
        const stars = this.add.graphics().setDepth(0);
        for (let i = 0; i < 90; i++) {
            stars.fillStyle(0xffffff, 0.25 + Math.random() * 0.5);
            stars.fillCircle(Math.random() * width, Math.random() * height, 0.4 + Math.random() * 1.4);
        }
    }

    /**
     * The tilted crawl plane: a perspective render-texture we draw the story into. The text object itself
     * is kept off the display list — it exists only to be drawn into the plane's texture each frame.
     */
    #buildCrawlPlane(width: number, height: number): void {
        const plane = new PerspectiveRenderTexture(this, width / 2, height * PLANE_CENTRE_Y, RT_WIDTH, RT_HEIGHT, {
            hideBackFace: false, // always render the plane, whichever way the tilt happens to face
            // Fine mesh grid: rex approximates the perspective per grid-cell, so a coarse grid makes the text
            // "swim"/wobble as it scrolls across the cell seams. Small cells keep the crawl rising smoothly.
            gridWidth: 24,
            gridHeight: 24,
        });
        plane.setAngleX(TILT_DEG);
        // rex's perspective mesh is a real Phaser game object at runtime, but its bundled types extend a
        // `Phaser.GameObjects.Mesh` that Phaser 4's typings don't expose — so inherited members (setDepth,
        // GameObject-ness) don't type-check. Cast for the display-list add; it sits at the default depth 0,
        // above the starfield (added earlier) and below the distance-fade + logo (added later).
        this.addExisting(plane as unknown as Phaser.GameObjects.GameObject);
        this.#plane = plane;

        // One text block: the episode line + paragraphs, wrapped to the plane width. Not added to the scene
        // (no addExisting/helper) — update() draws it into the plane's render-texture.
        this.#crawlText = new NPText(this, 0, 0, [INTRO_CRAWL.episode, ...INTRO_CRAWL.paragraphs].join('\n\n'), {
            fontFamily: 'sans-serif',
            fontSize: '46px',
            color: GOLD,
            align: 'center',
            wordWrap: { width: RT_WIDTH * 0.82 },
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5, 0);
    }

    /** Fades the far (top) third of the screen into black, so the receding text dissolves into the distance. */
    #paintDistanceFade(width: number, height: number): void {
        const fade = this.add.graphics().setDepth(8);
        const bands = 40;
        const fadeHeight = height * 0.34;
        const band = fadeHeight / bands;
        for (let i = 0; i < bands; i++) {
            fade.fillStyle(0x000000, (1 - i / bands) * 0.9);
            fade.fillRect(0, i * band, width, band + 1);
        }
    }

    /** The title: snaps in huge ("out of view"), settles readable at centre, then shrinks to a point + fades. */
    #buildLogo(width: number, height: number): void {
        const logo = centeredText(this, width / 2, height * 0.42, INTRO_CRAWL.title, {
            fontFamily: 'sans-serif',
            fontSize: '120px',
            fontStyle: 'bold',
            color: 'transparent', // hollow letters — outline only, no fill
            stroke: GOLD,
            strokeThickness: 4,
        }).setDepth(50);
        logo.setShadow(0, 0, '#ffcf52', 18); // soft golden glow so the hollow outline reads against the black
        logo.setScale(8);
        // Arrive: huge → readable at centre.
        this.tweens.add({ targets: logo, scale: 1, duration: 2600, delay: 500, ease: 'Sine.out' });
        // Recede: shrink to a point, fade, drift up — into the back.
        this.tweens.add({
            targets: logo,
            scale: 0.04,
            alpha: 0,
            y: logo.y - height * 0.12,
            duration: 4200,
            delay: 3600,
            ease: 'Sine.in',
        });
    }

    /** The opening line — fades in and out, centred, before the logo settles. */
    #buildOpeningLine(width: number, height: number): void {
        const opening = centeredText(this, width / 2, height * 0.3, INTRO_CRAWL.opening, {
            fontFamily: 'sans-serif',
            fontSize: '40px',
            color: SKY_BLUE,
            align: 'center',
            wordWrap: { width: Math.min(1100, width * 0.7) },
        })
            .setDepth(60)
            .setAlpha(0);
        this.tweens.add({ targets: opening, alpha: 1, duration: 800, delay: 200, hold: 1500, yoyo: true });
    }

    #finish(): void {
        if (this.#finished) return;
        this.#finished = true;
        this.#opts.onDone();
    }
}
