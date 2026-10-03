# Localization

These props are independent of each other and of `calendar` — you can display the BS calendar in English with Latin digits, or the AD calendar in Nepali with Devanagari digits.

## `locale`

Language for month and weekday names: `'en'` or `'ne'`. Left unset, each calendar system uses its own default — AD in English, BS in Nepali.

```tsx
<Calendar calendar='BS' locale='en' />   {/* "Kartik 2083" */}
<Calendar calendar='AD' locale='ne' />   {/* "अक्टोबर २०२६" */}
```

## `numerals`

Digits for every number on the page: `'latin'` or `'devanagari'`. Same default rule — AD is Latin, BS is Devanagari, unless you override it.

```tsx
<Calendar calendar='BS' numerals='latin' />  {/* "12 Kartik 2083" */}
```

## `labels`

Accessible names and button text ("Previous month", "Today", "Clear date", …) follow `locale`: English by default for AD, Nepali for BS. Override any of them, e.g. for another language:

```tsx
<Calendar labels={{ previousMonth: 'Mois précédent', nextMonth: 'Mois suivant', today: 'Aujourd’hui' }} />
```

The keys are `previousMonth`, `nextMonth`, `previousYear`, `nextYear`, `previousYears`, `nextYears`, `chooseMonth`, `chooseYear`, `today`, `presets`, `chooseDate` and `clear` (the `PatroLabels` type).

## `weekStartsOn`

First day of the week, `0`–`6` (`0` = Sunday, the default). Set `1` for a Monday-first week.

```tsx
<Calendar weekStartsOn={1} />
```

## `weekendDays`

Which weekdays get colored with `--patro-weekend`. Empty by default. Nepal's weekend is Saturday:

```tsx
<Calendar weekendDays={[6]} />
```

This only affects styling — combine it with [`isDateDisabled`](../reference/props) if weekends shouldn't be selectable.

## `showSecondaryDate`

Shows the other calendar's date as a small number on each day cell. On by default; set `showSecondaryDate={false}` to hide it.
