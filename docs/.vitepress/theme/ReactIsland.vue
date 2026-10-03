<script setup lang="ts">
// Mounts a React demo from ./demos in the browser only; the docs are server-rendered with Vue.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import type { Root } from 'react-dom/client';

const props = defineProps<{ demo: 'HeroCalendar' | 'Playground' }>();
const { isDark } = useData();
const el = ref<HTMLElement>();
let root: Root | undefined;
let render = () => {};

onMounted(async () => {
  const [{ createElement }, { createRoot }, demos] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./demos'),
  ]);
  root = createRoot(el.value!);
  render = () =>
    root?.render(createElement(demos[props.demo], { theme: isDark.value ? 'dark' : 'light' }));
  render();
});

watch(isDark, () => render());
onBeforeUnmount(() => root?.unmount());
</script>

<template>
  <div ref="el" />
</template>
