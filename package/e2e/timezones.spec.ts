import { expect, test } from '@playwright/test';

test.describe('Pacific/Kiritimati, which skipped 31 Dec 1994', () => {
  test.use({ timezoneId: 'Pacific/Kiritimati' });

  test('December 1994 renders all its days', async ({ page }) => {
    await page.goto('/?s=calendar&month=1994-12-15');
    await expect(page.locator('._patro_header_title')).toHaveText('December 1994');
    await expect(page.getByRole('gridcell', { name: /^30 December 1994/ })).toBeVisible();
  });
});

for (const timezoneId of ['America/Los_Angeles', 'Asia/Kathmandu', 'Pacific/Pago_Pago']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId });

    test('a picked day submits the same date', async ({ page }) => {
      await page.goto('/?s=closed');
      await page.getByRole('combobox').click();
      await page.getByRole('gridcell', { name: /^29 October 2026, १२ कार्तिक २०८३/ }).click();
      await expect(page.locator('input[name="date"]')).toHaveValue('2026-10-29');
    });
  });
}
