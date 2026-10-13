<script setup lang="ts">
// Mounts a React demo from ./demos or ./examples in the browser only; the docs are server-rendered with Vue.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import type { ComponentType } from 'react';
import type { Root } from 'react-dom/client';

const props = defineProps<{ demo: string }>();
const HOME_DEMOS = ['HeroCalendar', 'Playground'];
const { isDark } = useData();
const el = ref<HTMLElement>();
let root: Root | undefined;
let render = () => {};

onMounted(async () => {
  const [{ createElement }, { createRoot }, demos] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    HOME_DEMOS.includes(props.demo) ? import('./demos') : import('./examples'),
  ]);
  root = createRoot(el.value!);
  render = () =>
    root?.render(
      createElement((demos as Record<string, ComponentType<{ theme: string }>>)[props.demo], {
        theme: isDark.value ? 'dark' : 'light',
      }),
    );
  render();
});

watch(isDark, () => render());
onBeforeUnmount(() => root?.unmount());
</script>

<template>
  <div ref="el" />
</template>
