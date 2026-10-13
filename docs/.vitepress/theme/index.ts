import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import 'patrojs/style.css';
import './custom.css';
import './examples/examples.css';
import HeroBadge from './HeroBadge.vue';
import HeroInstall from './HeroInstall.vue';
import HomeDemo from './HomeDemo.vue';
import ReactIsland from './ReactIsland.vue';

export default {
  extends: DefaultTheme,
  enhanceApp: ({ app }) => {
    app.component('ReactIsland', ReactIsland);
  },
  // Layout slots, not page content: `.vp-doc` prose styles (e.g. `.vp-doc p`) would restyle the calendar.
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-info-before': () => h(HeroBadge),
      'home-hero-actions-after': () => h(HeroInstall),
      'home-hero-image': () => h('div', { class: 'hero-calendar' }, h(ReactIsland, { demo: 'HeroCalendar' })),
      'home-features-after': () => h(HomeDemo),
    }),
} satisfies Theme;
