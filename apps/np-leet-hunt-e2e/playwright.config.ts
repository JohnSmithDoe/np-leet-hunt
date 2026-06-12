import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
    ...nxE2EPreset(__filename, { testDir: './src' }),
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npx nx run np-leet-hunt:serve',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        cwd: workspaceRoot,
        timeout: 120000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
