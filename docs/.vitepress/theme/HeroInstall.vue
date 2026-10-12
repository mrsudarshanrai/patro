<script setup lang="ts">
import { ref } from 'vue';

const command = 'npm i patrojs';
const copied = ref(false);

const copy = async () => {
  await navigator.clipboard.writeText(command);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1600);
};
</script>

<template>
  <div class="hero-install">
    <code><span class="prompt">$</span> {{ command }}</code>
    <button type="button" :aria-label="copied ? 'Copied' : 'Copy install command'" @click="copy">
      {{ copied ? 'Copied' : 'Copy' }}
    </button>
  </div>
</template>
