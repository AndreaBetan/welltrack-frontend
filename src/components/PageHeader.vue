<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <header class="max-w-3xl">
    <p class="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#b98a81]">
      {{ eyebrow }}
    </p>
    <h1 class="m-0 text-4xl font-extrabold text-[#573e33] max-[640px]:text-3xl">
      {{ title }}
    </h1>
    <p class="mt-3 text-base leading-relaxed text-[#573e33]/70">
      {{ description }}
    </p>
  </header>
</template>
