import { expect, test } from '@playwright/test';
import { expectAttached, openScenario } from './popover';

test.use({ viewport: { width: 1280, height: 1000 } });

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

    test('Escape discards half-typed text and leaves the dialog open', async ({ page }) => {
      await page.goto(`/?s=${scenario}&closed&editable`);
      const field = page.getByRole('combobox');
      await field.focus();
      await page.keyboard.type('2026-1');
      await page.keyboard.press('Escape');
      await expect(field).toHaveValue('');
      await expect(page.locator('#dialog')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('#dialog')).toBeHidden();
    });

    test('after a click on the calendar’s padding, Escape closes only the popover', async ({
      page,
    }) => {
      const popover = await openScenario(page, scenario);
      await page.locator('._patro_container').click({ position: { x: 140, y: 3 } });
      await page.keyboard.press('Escape');
      await expect(popover).toHaveCount(0);
      await expect(page.locator('#dialog')).toBeVisible();
    });

    // Safari doesn't focus a clicked button; preventing mousedown does the same in any browser.
    test.describe('when a click on a button doesn’t focus it', () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          window.addEventListener('mousedown', (event) => event.preventDefault(), true);
        });
      });

      test('Escape after Next month closes only the popover', async ({ page }) => {
        const popover = await openScenario(page, scenario);
        await page.getByRole('button', { name: 'Next month' }).click();
        await page.keyboard.press('Escape');
        await expect(popover).toHaveCount(0);
        await expect(page.locator('#dialog')).toBeVisible();
      });

      test('Escape in the month picker returns to the days', async ({ page }) => {
        const popover = await openScenario(page, scenario);
        await page.getByRole('button', { name: /choose month/ }).click();
        await expect(page.getByRole('grid')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('grid')).toBeVisible();
        await expect(popover).toBeVisible();
        await expect(page.locator('#dialog')).toBeVisible();
      });
    });

    test('portalled into the dialog, a day can be picked from the keyboard and the mouse', async ({
      page,
    }) => {
      const popover = await openScenario(page, scenario, '&container');
      await expect(page.locator('#dialog ._patro_datepicker_popper')).toHaveCount(1);
      await expectAttached(page);
      await page.getByRole('grid').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await expect(popover).toHaveCount(0);
      await expect(page.getByRole('combobox')).toContainText('30 October 2026');

      await page.getByRole('combobox').click();
      await page.getByRole('gridcell', { name: /^12 October 2026/ }).click();
      await expect(page.getByRole('combobox')).toContainText('12 October 2026');
      await expect(page.locator('#dialog')).toBeVisible();
    });

    test('a day can be picked with the mouse', async ({ page }) => {
      await openScenario(page, scenario);
      await page.getByRole('gridcell', { name: /^12 October 2026/ }).click();
      await expect(page.getByRole('combobox')).toContainText('12 October 2026');
    });
  });
}
