/** Phaser will call this before all other */
export interface OnSceneInit {
    init: Phaser.Types.Scenes.SceneInitCallback;
}

/** Phaser will only call create after init has been called */
export interface OnScenePreload {
    preload: Phaser.Types.Scenes.ScenePreloadCallback;
}

/** Phaser will only call create after all assets in Preload have been loaded */
export interface OnSceneCreate {
    create: Phaser.Types.Scenes.SceneCreateCallback;
}

/** Phaser will only call create after all assets in Preload have been loaded */
export interface OnSceneUpdate {
    update: Phaser.Types.Scenes.SceneUpdateCallback;
}

export type TNPTextureKey = string;
