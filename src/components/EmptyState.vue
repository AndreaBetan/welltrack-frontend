<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <div class="rounded-lg border border-dashed border-[#b98a81]/45 bg-[#f7f1ec] px-6 py-10 text-center">
    <h3 class="text-lg font-bold text-[#573e33]">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#573e33]/65">
      {{ description }}
    </p>
  </div>
</template>
