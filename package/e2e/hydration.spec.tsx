import { expect, test } from '@playwright/test';
import { renderToString } from 'react-dom/server';
import { Datepicker } from '../index';

const props: Window['serverRender']['props'] = {
  label: 'Date',
  name: 'date',
  defaultValue: '2026-10-15',
  minDate: '2026-10-01',
  today: '2026-10-29',
};

for (const timezoneId of ['America/Los_Angeles', 'Pacific/Pago_Pago', 'Asia/Kathmandu']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId });

    test('string dates from the server hydrate to the same day', async ({ page }) => {
      const serverRender = { html: renderToString(<Datepicker {...props} />), props };
      await page.addInitScript((rendered) => {
        window.serverRender = rendered;
        window.hydrationErrors = [];
      }, serverRender);
      const errors: string[] = [];
      page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

      await page.goto('/?s=hydrate');
      await expect(page.getByRole('combobox')).toContainText('15 October 2026');
      await expect(page.locator('input[name="date"]')).toHaveValue('2026-10-15');
      expect(await page.evaluate(() => window.hydrationErrors)).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}
