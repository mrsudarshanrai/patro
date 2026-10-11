# Localization

`locale` and `numerals` are independent of each other and of `calendar`: you can display the BS calendar in English with Latin digits, or the AD calendar in Nepali with Devanagari digits.

**Unset, each calendar uses its own.** BS text is Nepali with Devanagari digits, AD text is English with Latin digits, even inside one calendar: a BS calendar shows its AD dates in English. **Set, it applies to both calendars**, AD and BS text alike.

```tsx
<Calendar calendar='BS' />                                      {/* "कार्तिक २०८३", under it "Oct – Nov 2026" */}
<Calendar calendar='BS' locale='ne' numerals='devanagari' />   {/* "कार्तिक २०८३", under it "अक्टोबर – नोभेम्बर २०२६" */}
```

## `locale`

Language for month and weekday names: `'en'` or `'ne'`. It doesn't change the digits; set `numerals` for those.

```tsx
<Calendar calendar='BS' locale='en' />                     {/* "Kartik २०८३" */}
<Calendar calendar='BS' locale='en' numerals='latin' />    {/* "Kartik 2083" */}
<Calendar calendar='AD' locale='ne' numerals='devanagari' /> {/* "अक्टोबर २०२६" */}
```

## `numerals`

Digits for every number: `'latin'` or `'devanagari'`. It doesn't change the names.

```tsx
<Calendar calendar='BS' numerals='latin' />  {/* "कार्तिक 2083" */}
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
