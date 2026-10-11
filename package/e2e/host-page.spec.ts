import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?s=host-page');
  await expect(page.getByRole('grid')).toBeVisible();
});

test('the stylesheet leaves the page’s own font weights alone', async ({ page }) => {
  for (const selector of ['h1', 'strong']) {
    const weight = await page.locator(selector).evaluate((el) => getComputedStyle(el).fontWeight);
    expect(Number(weight)).toBeGreaterThanOrEqual(700);
  }
});

test('--patro-input-width: 100% fills the column', async ({ page }) => {
  const field = await page.locator('.column ._patro_datepicker_input').boundingBox();
  expect(field?.width).toBe(600);
});

test('page styles for svg, header and p don’t reach the components', async ({ page }) => {
  const icon = await page.locator('.column ._patro_datepicker_input svg').boundingBox();
  expect(icon?.width).toBe(16);
  await expect(page.locator('._patro_header')).not.toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await expect(page.getByRole('gridcell').first()).not.toHaveCSS('margin-top', '40px');
});

test('the calendar adds no landmark to the page', async ({ page }) => {
  await expect(page.getByRole('banner')).toHaveCount(1);
});
