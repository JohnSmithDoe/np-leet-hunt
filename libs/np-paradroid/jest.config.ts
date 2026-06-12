/* eslint-disable */
export default {
    displayName: 'np-paradroid',
    preset: '../../jest.preset.js',
    setupFiles: ['jest-canvas-mock'],
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    testEnvironment: 'jsdom',
    coverageDirectory: '../../coverage/libs/np-paradroid',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@ionic|@stencil|ionicons|phaser3-rex-plugins)'],
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
};
