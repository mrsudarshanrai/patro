<script setup lang="ts">
import ReactIsland from './ReactIsland.vue';
</script>

<template>
  <section id="try-it" class="home-section">
    <p class="home-eyebrow">Playground</p>
    <h2 class="home-title">Try it</h2>
    <p class="home-lead">
      Switch calendars, pick a day or a range, or type a date like <code>2083-07-12</code> into the
      Datepicker. The panel shows exactly what <code>onChange</code> gives you.
    </p>
    <div class="playground">
      <ReactIsland demo="Playground" />
    </div>
    <p class="home-more">
      <a href="/storybook/" target="_blank">Every prop, live, in Storybook →</a>
    </p>
  </section>
</template>
