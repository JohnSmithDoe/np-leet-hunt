import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/libs/np-library',
    plugins: [angular(), nxViteTsPaths()],
    test: {
        name: 'np-library',
        watch: false,
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.spec.ts'],
        setupFiles: ['src/test-setup.ts'],
        passWithNoTests: true,
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/libs/np-library',
            provider: 'v8',
        },
        deps: { optimizer: { web: { include: ['vitest-canvas-mock'] } } },
        // ionic's fesm bundles use directory imports that node ESM rejects; let vite resolve them
        server: { deps: { inline: ['@ionic/angular', '@ionic/core', 'ionicons'] } },
    },
});
