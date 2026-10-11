import { expect, test } from '@playwright/test';
import { openScenario } from './popover';

for (const scenario of ['native-dialog', 'radix-dialog', 'headless-dialog']) {
  test.describe(scenario, () => {
    test('the first Escape closes only the popover, the second the dialog', async ({ page }) => {
      const popover = await openScenario(page, scenario);
      const dialog = page.locator('#dialog');
      await page.getByRole('grid').focus();

      await page.keyboard.press('Escape');
      await expect(popover).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(page.getByRole('combobox')).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });

    test('a day can be picked with the mouse', async ({ page }) => {
      await openScenario(page, scenario);
      await page.getByRole('gridcell', { name: /^12 October 2026/ }).click();
      await expect(page.getByRole('combobox')).toContainText('12 October 2026');
    });
  });
}
