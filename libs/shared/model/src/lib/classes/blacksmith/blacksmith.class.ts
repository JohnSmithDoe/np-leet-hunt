/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-magic-numbers, @typescript-eslint/no-unsafe-argument */
import { CheapSword, FancySword, Human, SwordTypeEnum } from '@shared/model';
import { PhaserService } from '@shared/phaser';
import * as Phaser from 'phaser';

export class Blacksmith extends Phaser.GameObjects.Sprite implements Human {
    public static hammeringKey = 'blacksmith_hammer';
    public static idleKey = 'blacksmith_idle';
    public static spriteSheet = 'assets/blacksmith/blacksmith_sprites.png';
    public static atlast = 'assets/blacksmith/blacksmith_sprites_atlas.json';
    public static animation = 'assets/blacksmith/blacksmith_sprites_anim.json';
    constructor(phaserScene: Phaser.Scene, private service: PhaserService) {
        // * Set the blacksmith's position relative to Phaser's Origin
        super(phaserScene, -1111.6, 331, Blacksmith.hammeringKey);
        this.scene.add.existing(this);
        this.setVisible(true);
        this.play(Blacksmith.idleKey);
    }

    /**
     * * Builds respective class asynchronously
     *
     * @param phaserScene
     * @param service
     * @returns Promise<Blacksmith>
     */
    public static async build(phaserScene: Phaser.Scene, service: PhaserService): Promise<Blacksmith> {
        console.log('blacksmith.class', 'constructor()');
        const tempObject = new Blacksmith(phaserScene, service);
        try {
            return tempObject;
        } catch (e) {
            console.error('Error creating blacksmith');
        }
    }

    /**
     * * Sets the blacksmith's animation to Idle
     */
    public setIdle(): void {
        console.log('Blacksmith going to idle!');
        this.play(Blacksmith.idleKey);
    }

    /**
     * * Sets the blacksmith's animation to Hammering
     */
    public async buildSword(_type: SwordTypeEnum): Promise<void> {
        console.log('blacksmith.class.ts', 'buildSword()', _type);

        // * Start the animation
        this.play(Blacksmith.hammeringKey);
        // * Start building the sword
        let tmpSword;
        if (_type === SwordTypeEnum.FANCY) {
            tmpSword = await FancySword.build(this.service.game.scene.scenes[0]);
        } else if (_type === SwordTypeEnum.CHEAP) {
            tmpSword = await CheapSword.build(this.service.game.scene.scenes[0]);
        }
        if (tmpSword) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.service.actionsHistory.push(tmpSword.type, ' sword completed! ');
        }
        // * Now let's play the animation associated with
        this.play(Blacksmith.idleKey);
    }
}
