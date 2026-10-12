import { expect, test } from '@playwright/test';

const title = (page: import('@playwright/test').Page) => page.locator('._patro_header_title');

test.beforeEach(async ({ page }) => {
  await page.goto('/?s=calendar');
  await expect(page.getByRole('grid')).toBeVisible();
});

test('picking a year then a month with the keyboard keeps focus in the calendar', async ({
  page,
}) => {
  await page.locator('._patro_header_titleBtn').focus();
  await page.keyboard.press('Enter');
  await page.locator('._patro_header_titleBtn').focus();
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: '2024' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'January' })).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(title(page)).toHaveText('February 2024');
  await expect(page.getByRole('grid')).toBeFocused();
});

test('Escape in the month picker returns focus to the day grid', async ({ page }) => {
  await page.locator('._patro_header_titleBtn').click();
  await page.getByRole('button', { name: 'October' }).focus();
  await page.keyboard.press('Escape');
  await expect(title(page)).toHaveText('October 2026');
  await expect(page.getByRole('grid')).toBeFocused();
});

test('arrow keys and PageDown move the active day', async ({ page }) => {
  await page.getByRole('grid').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('grid')).toHaveAttribute('aria-activedescendant', /2026-10-30$/);
  await page.keyboard.press('PageDown');
  await expect(page.getByRole('grid')).toHaveAttribute('aria-activedescendant', /2026-11-30$/);
  await expect(title(page)).toHaveText('November 2026');
});

test('today is marked with aria-current', async ({ page }) => {
  await expect(page.locator('[aria-current="date"]')).toHaveAttribute(
    'aria-label',
    /^29 October 2026/,
  );
});

test.describe('keyboard-opened portalled popover (N1)', () => {
  test('portal: opens with focus on the grid and stays open', async ({ page }) => {
    await page.goto('/?s=closed&portal');
    await page.getByRole('combobox').focus();
    await page.keyboard.press('Enter');
    const grid = page.getByRole('grid');
    await expect(grid).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(grid).toHaveAttribute('aria-activedescendant', /2026-10-30$/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('combobox')).toContainText('30 October 2026');
    await expect(page.locator('input[name="date"]')).toHaveValue('2026-10-30');
  });

  test('portalContainer in a Radix dialog: arrows work, Escape closes only the popover', async ({
    page,
  }) => {
    await page.goto('/?s=radix-dialog&container&closed');
    await page.getByRole('combobox').focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(grid).toHaveAttribute('aria-activedescendant', /2026-10-28$/);

    await page.keyboard.press('Escape');
    await expect(page.locator('._patro_datepicker_popper')).toHaveCount(0);
    await expect(page.locator('#dialog')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeFocused();
  });
});
