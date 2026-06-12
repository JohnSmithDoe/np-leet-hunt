import { expect, test } from '@playwright/test';

test('boots the game and shows the Phaser stage', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('ion-title', { hasText: 'Home' })).toBeVisible();
    // Phaser attaches its canvas inside the <np-stage> container once the game is up
    await expect(page.locator('np-stage canvas')).toBeVisible({ timeout: 30000 });
});
