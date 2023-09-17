/** Phaser will call this before all other */
export interface OnSceneInit {
    init(): Promise<void>;
}

/** Phaser will only call create after init has been called */
export interface OnScenePreload {
    preload(): Promise<void>;
}

/** Phaser will only call create after all assets in Preload have been loaded */
export interface OnSceneCreate {
    create(): Promise<void>;
}
