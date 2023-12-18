import { NPGameObjectList } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { createRectangle } from '../../../../np-phaser/src/lib/factories/graphics.factory';
import { NPButton } from '../../../../np-phaser/src/lib/sprites/button/NpButton';
import { DashedLine } from '../../../../np-phaser/src/lib/sprites/dashed-line/dashed-line';
import { NPMovableSprite } from '../../../../np-phaser/src/lib/sprites/np-movable-sprite';
import { getClosest, pointOnAngle } from '../../../../np-phaser/src/lib/utilities/np-phaser-utils';
import { Planet } from '../planet/planet';
import { Starmap, StarmapFactory } from './starmap.factory';

export class NPSpaceMap extends NPGameObjectList {
    private rocket: NPMovableSprite;
    #debug = false;
    #start: Planet;
    #map: Starmap;
    #planets: Planet[] = [];
    #connections: { from: Planet; to: Planet; line: DashedLine; travelFrom: NPButton; travelTo: NPButton }[] = [];
    #outerSpace: Planet[] = [];

    init = () => {
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 1, 'bg');
        // this.addTileSpriteLayer('space-stars', 'assets/example/stars.png', 2, 'fg');
        console.log('add a planet');
        this.#map = StarmapFactory.create({
            planets: 12,
            width: 15000,
            height: 15000,
            minDistance: 1750,
            outerSpaceDim: 5000,
        });
        this.#initPlanets();
        this.#initConnections();
        if (this.#debug) this.#debugDraw(this.#map);
        super.init();
    };

    get startingPlanet() {
        return this.#start;
    }
    #debugDraw(map: Starmap) {
        const rectInner = createRectangle(this.scene, map.inner);
        const rectMap = createRectangle(this.scene, new Phaser.Geom.Rectangle(0, 0, map.width, map.height));
        const rectOuter = createRectangle(
            this.scene,
            new Phaser.Geom.Rectangle(-5000, -5000, map.width + 10e3, map.height + 10e3)
        );
        this.scene.addExisting(rectInner);
        this.scene.addExisting(rectMap);
        this.scene.addExisting(rectOuter);
        this.scene.debugOut(`planets ${map.coords.planets.length}`);
        const g = this.scene.add.graphics({ lineStyle: { width: 6 } });
        g.setDepth(100);
        this.#connections.forEach(conn => {
            g.lineBetween(conn.from.x, conn.from.y, conn.to.x, conn.to.y);
        });
        const g2 = this.scene.add.graphics({ lineStyle: { width: 6, color: 0xff0000 } });
        g2.setDepth(101);
        this.#connections.forEach(conn => {
            const angle = Phaser.Math.Angle.BetweenPoints(conn.from, conn.to);
            const buttonPos = pointOnAngle(conn.from, angle, 300);
            g2.lineBetween(conn.from.x, conn.from.y, buttonPos.x, buttonPos.y);
        });
    }

    private travelTo(target: { x?: number; y?: number }) {
        this.#connections.forEach(conn => {
            conn.line.alpha = 0.2;
            conn.travelTo.alpha = 0;
            conn.travelFrom.alpha = 0;
        });
        this.rocket.onceMoved(() => {
            this.#connections.forEach(conn => {
                conn.line.alpha = 0.8;
                conn.travelTo.alpha = 1;
                conn.travelFrom.alpha = 1;
            });
        });
        this.rocket.moveToTarget(target);
    }

    public setRocket(rocket: NPMovableSprite) {
        this.rocket = rocket;
    }

    #initPlanets() {
        let topLeft: Planet;
        for (const coords of this.#map.coords.planets) {
            const planet = this.#addPlanet(coords, false).setDepth(3);
            this.#planets.push(planet);
            if (!topLeft || (topLeft.x > coords.x && topLeft.y > coords.y)) {
                topLeft = planet;
            }
        }
        this.#start = topLeft;
        for (const coords of this.#map.coords.outerSpace) {
            const outerPlanet = this.#addPlanet(coords, true).setDepth(3).setScale(6);
            this.#outerSpace.push(outerPlanet);
        }
    }

    #addPlanet(coords: Phaser.Types.Math.Vector2Like, isOuter: boolean): Planet {
        const type = this.#getPlanetType(isOuter);
        const planet = new Planet(this.scene, type).setPosition(coords.x, coords.y);
        planet.setOrigin(0.5);
        return this.add(planet) as Planet;
    }

    #getPlanetType(isOuter: boolean) {
        if (isOuter) return 'planetSun';
        let type = Planet.getRandom();
        while (type === 'planetSun') {
            type = Planet.getRandom();
        }
        return type;
    }

    #initConnections() {
        for (const planet of this.#planets) {
            const closest = getClosest(planet, this.#planets, 3);
            for (const target of closest) {
                this.#connect(planet, target);
            }
        }
        for (const planet of this.#outerSpace) {
            const closest = getClosest(planet, this.#planets, 2);
            for (const target of closest) {
                this.#connect(planet, target);
            }
        }
    }

    #connect(planet: Planet, target: { x: number; y: number; item: Planet }) {
        const size = 128;
        if (!this.#connections.find(conn => conn.from === target.item && conn.to === planet)) {
            const line = new DashedLine(this.scene, 'dashedLineRed', planet, target);
            line.setDepth(2);
            this.add(line);
            let angle = Phaser.Math.Angle.BetweenPoints(planet, target);
            let buttonPos = pointOnAngle(planet, angle, 300);
            const btnFrom = new NPButton(this.scene, buttonPos.x, buttonPos.y, { width: size, height: size });
            btnFrom.on(NPButton.EVENT_CLICK, () => {
                this.travelTo(target);
            });
            btnFrom.setDepth(5).setOrigin(0.5);
            this.add(btnFrom);
            angle = Phaser.Math.Angle.BetweenPoints(target, planet);
            buttonPos = pointOnAngle(target, angle, 300);
            const btnTo = new NPButton(this.scene, buttonPos.x, buttonPos.y, { width: size, height: size });
            btnTo.on(NPButton.EVENT_CLICK, () => {
                this.travelTo(planet);
            });
            btnTo.setDepth(5).setOrigin(0.5);
            this.add(btnTo);
            this.#connections.push({ from: planet, to: target.item, line, travelFrom: btnFrom, travelTo: btnTo });
        }
    }
}
