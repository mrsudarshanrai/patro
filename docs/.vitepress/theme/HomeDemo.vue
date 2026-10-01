<script setup lang="ts">
// Mounts the React demo in the browser only; the docs are server-rendered with Vue.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';
import type { Root } from 'react-dom/client';

const { isDark, theme } = useData();
const el = ref<HTMLElement>();
const storybookUrl: string = theme.value.storybookUrl ?? '';
let root: Root | undefined;
let render = () => {};

onMounted(async () => {
  const [{ createElement }, { createRoot }, { HomeDemo }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./HomeDemo'),
  ]);
  root = createRoot(el.value!);
  render = () => root?.render(createElement(HomeDemo, { theme: isDark.value ? 'dark' : 'light' }));
  render();
});

watch(isDark, () => render());
onBeforeUnmount(() => root?.unmount());
</script>

<template>
  <section class="demo-section">
    <h2>Try it</h2>
    <p>
      Pick a day or a range in either calendar. The Datepicker also takes typed dates, like
      <code>2083-07-12</code>.
    </p>
    <div ref="el" class="demo-root" />
    <p class="demo-more">
      <a v-if="storybookUrl" :href="storybookUrl" target="_blank" rel="noreferrer">
        More examples in Storybook →
      </a>
      <a v-else :href="withBase('/storybook')">More examples in Storybook (coming soon) →</a>
    </p>
  </section>
</template>
