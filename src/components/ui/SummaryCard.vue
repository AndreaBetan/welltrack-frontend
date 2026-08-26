<script setup>
import { computed } from "vue";

defineOptions({ name: "SummaryCard" });

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  helper: { type: String, default: "" },
  icon: { type: [Object, Function], required: true },
  tone: { type: String, default: "neutral" },
});

const tones = {
  emerald: {
    card: "bg-emerald-50/70",
    icon: "bg-emerald-100 text-emerald-700",
    label: "text-emerald-950/75",
    helper: "text-emerald-700",
  },
  orange: {
    card: "bg-orange-50/70",
    icon: "bg-orange-100 text-orange-600",
    label: "text-orange-950/75",
    helper: "text-orange-700",
  },
  amber: {
    card: "bg-amber-50/80",
    icon: "bg-amber-100 text-amber-600",
    label: "text-amber-950/75",
    helper: "text-amber-700",
  },
  purple: {
    card: "bg-purple-50/80",
    icon: "bg-purple-100 text-purple-700",
    label: "text-purple-950/75",
    helper: "text-purple-700",
  },
  blue: {
    card: "bg-blue-50/80",
    icon: "bg-blue-100 text-blue-600",
    label: "text-blue-950/75",
    helper: "text-blue-700",
  },
  neutral: {
    card: "bg-[#f7f1ec]",
    icon: "bg-white text-[#a46f62]",
    label: "text-[#573e33]/75",
    helper: "text-[#573e33]/60",
  },
};

const selectedTone = computed(() => tones[props.tone] ?? tones.neutral);
</script>

<template>
  <article class="flex min-w-0 items-center gap-4 rounded-xl p-4" :class="selectedTone.card">
    <span
      class="grid size-12 shrink-0 place-items-center rounded-full"
      :class="selectedTone.icon"
    >
      <component :is="icon" :size="25" aria-hidden="true" />
    </span>
    <div class="min-w-0">
      <strong class="block text-xl text-[#573e33]">{{ value }}</strong>
      <p class="text-sm font-semibold" :class="selectedTone.label">{{ label }}</p>
      <span v-if="helper" class="mt-1 block text-xs" :class="selectedTone.helper">
        {{ helper }}
      </span>
    </div>
  </article>
</template>
