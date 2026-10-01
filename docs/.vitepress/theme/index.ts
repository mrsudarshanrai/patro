import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import 'patro/style.css';
import './demo.css';
import HomeDemo from './HomeDemo.vue';

export default {
  extends: DefaultTheme,
  // A layout slot, not page content: `.vp-doc` prose styles (e.g. `.vp-doc p`) would restyle the calendar.
  Layout: () => h(DefaultTheme.Layout, null, { 'home-features-after': () => h(HomeDemo) }),
} satisfies Theme;
