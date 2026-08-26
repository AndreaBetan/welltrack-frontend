<script setup>
import { computed } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import { icons } from "@/icons";

const props = defineProps({
  recommendation: { type: Object, required: true },
});

const categoryConfig = {
  nutrition: {
    label: "Alimentación",
    icon: icons.navigation.nutrition,
    iconClass: "bg-orange-50 text-orange-600",
  },
  activity: {
    label: "Actividad física",
    icon: icons.navigation.activity,
    iconClass: "bg-emerald-50 text-emerald-700",
  },
  sleep: {
    label: "Sueño",
    icon: icons.navigation.sleep,
    iconClass: "bg-purple-50 text-purple-700",
  },
  wellbeing: {
    label: "Bienestar",
    icon: icons.navigation.recommendations,
    iconClass: "bg-rose-50 text-rose-600",
  },
};

const priorityLabels = { low: "Sugerencia", medium: "Importante", high: "Prioritaria" };
const priorityClasses = {
  low: "bg-[#f7f1ec] text-[#8d5d50]",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};
const category = computed(() => categoryConfig[props.recommendation.category] || categoryConfig.wellbeing);
</script>

<template>
  <BaseCard class="grid content-start gap-4 bg-white p-5">
    <header class="flex items-start gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl" :class="category.iconClass">
        <component :is="category.icon" aria-hidden="true" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-[#f7f1ec] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-[#8d5d50]">
            {{ category.label }}
          </span>
          <span class="rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide" :class="priorityClasses[recommendation.priority] || priorityClasses.low">
            {{ priorityLabels[recommendation.priority] || "Sugerencia" }}
          </span>
        </div>
        <h2 class="mt-2 text-lg font-extrabold leading-snug text-[#573e33]">{{ recommendation.title }}</h2>
      </div>
    </header>

    <p class="border-t border-[#b98a81]/15 pt-4 text-sm leading-relaxed text-[#573e33]/72">
      {{ recommendation.description }}
    </p>
  </BaseCard>
</template>
