<script setup>
import BaseCard from "@/components/ui/BaseCard.vue";

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  helper: { type: String, default: "" },
});
</script>

<template>
  <BaseCard>
    <p class="text-sm font-bold uppercase tracking-[0.08em] text-[#b98a81]">{{ label }}</p>
    <strong class="mt-3 block text-3xl font-extrabold text-[#573e33]">{{ value }}</strong>
    <p v-if="helper" class="mt-2 text-sm leading-relaxed text-[#573e33]/65">{{ helper }}</p>
  </BaseCard>
</template>
