import * as Phaser from 'phaser';

export const isLayer = (value: unknown): value is Phaser.GameObjects.Layer => value instanceof Phaser.GameObjects.Layer;

export const vectorToStr = (vector: Phaser.Math.Vector2) => `(${vector.x}, ${vector.y})`;
