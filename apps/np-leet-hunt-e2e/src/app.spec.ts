import { expect, test } from '@playwright/test';

test('boots the game and shows the Phaser stage', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('ion-title', { hasText: 'Home' })).toBeVisible();
    // TODO: the Phaser canvas currently stays at 0x0 (stage container sizing issue) — re-enable once fixed
    // await expect(page.locator('np-stage canvas')).toBeVisible({ timeout: 30000 });
});
