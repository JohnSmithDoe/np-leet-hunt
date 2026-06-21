export * from './lib/service/stage.service';
export * from './lib/service/phaser.service';
export * from './lib/scenes/world.scene';
export * from './lib/basics/stage/stage.component';
export * from './lib/scenes/np-scene';
export * from './lib/scenes/np-scene-component';
export * from './lib/scenes/placeholder.scene';

// Public game-framework surface consumed by the game-mode libs (np-paradroid, np-space-map,
// np-pixel-dungeon). Exported here so those libs import via the `@shared/np-phaser` alias instead of
// reaching into these paths with deep relative imports. NOTE: np-phaser's own foundational modules
// must keep importing siblings *relatively* (and only as types where they reference NPScene/
// NPGameObject) — a value `extends` pulled from this barrel would create a self-import cycle.
export * from './lib/sprites/np-sprite';
export * from './lib/sprites/np-text';
export * from './lib/sprites/np-tile-sprite';
export * from './lib/sprites/np-rectangle';
export * from './lib/sprites/np-movable-sprite';
export * from './lib/sprites/dashed-line/dashed-line';
export * from './lib/sprites/button/np-button';
export * from './lib/sprites/button/text-button';
export * from './lib/sprites/image/image';
export * from './lib/sprites/timer/binarytimer';
export * from './lib/utilities/np-phaser-utils';
export * from './lib/utilities/np-math';
export * from './lib/utilities/np-tween';
// lifecycle interfaces live in a .d.ts — re-export as types only so no runtime require is emitted
export type { OnSceneInit, OnScenePreload, OnSceneCreate, OnSceneUpdate, TNPTextureKey } from './lib/types/np-phaser';
