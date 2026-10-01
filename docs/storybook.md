<script setup>
import { useData } from 'vitepress';

const storybookUrl = useData().theme.value.storybookUrl;
</script>

# Interactive playground (Storybook)

Every prop has a live, interactive story in patro's Storybook: both components in AD and BS, range mode, every locale/numerals/theme combination, disabled/read-only/invalid states, and three complete template forms (a BS registration form, a date-range hotel booking form, and a fully Nepali leave-application form) — each showing the real submitted form data.

This docs site deliberately doesn't duplicate that interactive layer; it covers concepts, usage, and the full prop/type reference instead.

<p v-if="storybookUrl"><a :href="storybookUrl" target="_blank" rel="noreferrer">Open Storybook →</a></p>

<div v-else>

::: tip Not deployed yet
Storybook isn't hosted anywhere public yet. Until it is, run it from the main [patro repo](https://github.com/mrsudarshanrai/patro):

```bash
git clone https://github.com/mrsudarshanrai/patro
cd patro
npm ci
npm run storybook
```

Once it's deployed, this page will link straight to it.
:::

</div>

## What's in there

- **Calendar**: every prop, in AD and BS: secondary date on/off, range mode, locale/numerals, min/max dates, disabled days, weekends and holidays, `dayContent`/`dayLabel` event dots, week start, variable-height months, the Today button, `defaultMonth` and a controlled `month`, presets (single and range), range rules around booked nights, two months side by side, custom `labels`, a pinned `today`, a keyboard reference, dark theme, custom CSS-token colours, live `onChange`/`onMonthChange` output, and the edges of the supported range.
- **Datepicker**: the same, plus typing dates (`editable`, AD and BS), a date-of-birth picker, presets, a two-month stay picker, clearable, disabled/read-only/invalid, `formatValue`, controlled value/range/popover, `placement`, `portal`, a layout-shift check, and dark theme.
- **Templates → Forms**: real `<form>` examples using native validation and `FormData`: a BS registration form with a typeable date of birth, a two-month hotel booking around booked nights, and a Nepali leave application.
- **Utilities → Date converter**: an interactive `ad2Bs`/`bs2Ad`/`isValidAdDate`/`isValidBsDate` tool.
