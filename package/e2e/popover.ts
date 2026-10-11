import { expect, type Page } from '@playwright/test';

export const GAP = 6;

export const openScenario = async (page: Page, scenario: string, query = '') => {
  await page.goto(`/?s=${scenario}${query}`);
  const popover = page.locator('._patro_datepicker_popper');
  await expect(popover).toHaveCSS('opacity', '1');
  return popover;
};

export const geometry = async (page: Page) => {
  const field = await page.locator('._patro_datepicker_input').boundingBox();
  const popover = await page.locator('._patro_datepicker_popper').boundingBox();
  const viewport = page.viewportSize();
  if (!field || !popover || !viewport) throw new Error('field, popover or viewport not measurable');
  return {
    field,
    popover,
    viewport,
    below: Math.round(popover.y - (field.y + field.height)),
    above: Math.round(field.y - (popover.y + popover.height)),
  };
};

export const expectAttached = async (page: Page) => {
  const { below, above } = await geometry(page);
  expect([below, above]).toContain(GAP);
};

export const expectInsideViewport = async (page: Page, { bottom = true } = {}) => {
  const { popover, viewport } = await geometry(page);
  expect(popover.x).toBeGreaterThanOrEqual(0);
  expect(popover.y).toBeGreaterThanOrEqual(0);
  expect(popover.x + popover.width).toBeLessThanOrEqual(viewport.width);
  if (bottom) expect(popover.y + popover.height).toBeLessThanOrEqual(viewport.height);
};
