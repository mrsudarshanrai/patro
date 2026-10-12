import { expect, test } from '@playwright/test';
import { expectAttached, expectInsideViewport, geometry, openScenario } from './popover';

type Box = { x: number; width: number };

test.describe('placement', () => {
  test.use({ viewport: { width: 1000, height: 900 } });

  const alignments = {
    start: (field: Box, popover: Box) => popover.x - field.x,
    end: (field: Box, popover: Box) => popover.x + popover.width - (field.x + field.width),
    center: (field: Box, popover: Box) =>
      popover.x + popover.width / 2 - (field.x + field.width / 2),
  };
  for (const placement of ['bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top']) {
    test(placement, async ({ page }) => {
      await openScenario(page, 'placement', `&p=${placement}`);
      const [side, align = 'center'] = placement.split('-') as [string, keyof typeof alignments];
      const { field, popover, below, above } = await geometry(page);
      expect(side === 'top' ? above : below).toBe(6);
      expect(Math.round(alignments[align](field, popover))).toBe(0);
    });
  }
});

test.describe('near the viewport edges', () => {
  test.use({ viewport: { width: 700, height: 700 } });

  test('shifts left at the right edge', async ({ page }) => {
    await openScenario(page, 'right-edge');
    await expectAttached(page);
    await expectInsideViewport(page);
  });

  test('portalled, shifts left at the right edge', async ({ page }) => {
    await openScenario(page, 'right-edge', '&portal');
    await expectAttached(page);
    await expectInsideViewport(page);
  });

  test('flips above at the bottom edge', async ({ page }) => {
    await openScenario(page, 'bottom-edge');
    const { above } = await geometry(page);
    expect(above).toBe(6);
    await expectInsideViewport(page);
  });

  test('stays attached after switching to the month picker', async ({ page }) => {
    await openScenario(page, 'right-edge');
    await page.locator('._patro_header_titleBtn').click();
    await expectAttached(page);
    await expectInsideViewport(page);
  });
});

test.describe('small screens', () => {
  test('two months stack on a phone, without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openScenario(page, 'two-months');
    await expectAttached(page);
    await expectInsideViewport(page, { bottom: false });
    const scrollsSideways = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(scrollsSideways).toBe(false);
  });

  test('two months on a phone: the page scrolls to the last week and it can be picked (N2)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const popover = await openScenario(page, 'two-months');
    const lastDay = page.getByRole('gridcell', { name: /^30 November 2026/ });
    await lastDay.scrollIntoViewIfNeeded();
    await expect(popover).toHaveCSS('visibility', 'visible');
    await lastDay.click();
    await expect(lastDay).toHaveAttribute('aria-selected', 'true');
  });

  test('a landscape phone keeps the header on screen', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await openScenario(page, 'short-viewport');
    await expectAttached(page);
    await expectInsideViewport(page, { bottom: false });
  });
});

test.describe('follows the field', () => {
  test.use({ viewport: { width: 700, height: 700 } });

  test('when content above it appears', async ({ page }) => {
    await openScenario(page, 'layout-shift');
    await page.evaluate(() => document.getElementById('shift')?.click());
    await expect(async () => expectAttached(page)).toPass();
  });

  test('when its scroll container scrolls', async ({ page }) => {
    await openScenario(page, 'scroll-container');
    await page.evaluate(() => document.getElementById('scroller')?.scrollTo(0, 30));
    await expect(async () => expectAttached(page)).toPass();
  });

  test('portalled, when the page scrolls', async ({ page }) => {
    await openScenario(page, 'portal-scroll');
    await page.evaluate(() => window.scrollTo(0, 30));
    await expect(async () => expectAttached(page)).toPass();
  });

  test('hides once the field scrolls out of its container', async ({ page }) => {
    const popover = await openScenario(page, 'scroll-container');
    await page.evaluate(() => document.getElementById('scroller')?.scrollTo(0, 400));
    await expect(popover).toHaveCSS('visibility', 'hidden');
  });
});

test('opening from the keyboard focuses the day grid', async ({ page }) => {
  await page.goto('/?s=closed');
  await page.locator('._patro_datepicker_input').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('grid')).toBeFocused();
  await expect(page.locator('._patro_datepicker_popper')).toHaveCSS('opacity', '1');
});
