import { expect, test, type Locator } from '@playwright/test';

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

test.describe('theme tokens', () => {
  for (const [name, css] of [
    ['new name', '._patro { --patro-selected-bg: rgb(1, 2, 3) }'],
    ['beta name still works', '._patro { --patro-sel-bg: rgb(1, 2, 3) }'],
  ]) {
    test(`--patro-selected-bg: ${name}`, async ({ page }) => {
      await page.goto('/?s=calendar&value=2026-10-12');
      await page.addStyleTag({ content: css });
      await expect(page.locator('._patro_dates_current_date')).toHaveCSS(
        'background-color',
        'rgb(1, 2, 3)',
      );
    });
  }
});

const token = (locator: Locator, name: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name).trim(), name);

test.describe('themes in a dark ancestor', () => {
  const LIGHT = '#f3f5fe';
  const DARK = '#232532';

  test.beforeEach(async ({ page }) => {
    await page.goto('/?s=themes');
    await expect(page.getByRole('grid').first()).toBeVisible();
  });

  test('theme=light stays light, no theme follows the ancestor', async ({ page }) => {
    expect(await token(page.locator('.light-in-dark'), '--patro-surface')).toBe(LIGHT);
    expect(await token(page.locator('.follows-dark'), '--patro-surface')).toBe(DARK);
  });

  test('a light Datepicker is light in its field and popover', async ({ page }) => {
    expect(await token(page.locator('.picker-in-dark'), '--patro-surface')).toBe(LIGHT);
    const calendar = page.locator('.picker-in-dark ._patro_container');
    expect(await token(calendar, '--patro-surface')).toBe(LIGHT);
  });
});

test('a global ._patro override still applies to an explicit theme=light', async ({ page }) => {
  await page.goto('/?s=calendar&value=2026-10-12');
  await page.addStyleTag({ content: '._patro { --patro-surface: rgb(1, 2, 3) }' });
  const root = page.locator('._patro').first();
  await root.evaluate((el) => el.setAttribute('data-theme', 'light'));
  expect(await token(root, '--patro-surface')).toBe('rgb(1, 2, 3)');
});

test('Datepicker style tokens reach the calendar, inline and portalled', async ({ page }) => {
  await page.goto('/?s=field-tokens');
  await expect(page.getByRole('grid')).toHaveCount(2);
  const inline = page.locator('.inline-picker ._patro_container');
  expect(await token(inline, '--patro-accent')).toBe('rgb(1, 2, 3)');
  const portalled = page.locator('body > ._patro_datepicker_popper ._patro_container');
  expect(await token(portalled, '--patro-accent')).toBe('rgb(4, 5, 6)');
});
