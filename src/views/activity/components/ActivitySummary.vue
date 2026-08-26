<script setup>
import { icons } from "@/icons";
import SummaryCard from "@/components/ui/SummaryCard.vue";

defineOptions({ name: "ActivitySummary" });

defineProps({
  summary: { type: Object, required: true },
});
</script>

<template>
  <section
    class="grid grid-cols-4 gap-4 rounded-2xl border border-[#b98a81]/20 bg-white p-5 shadow-[0_12px_35px_rgba(87,62,51,0.05)] max-[1050px]:grid-cols-2 max-[560px]:grid-cols-1"
  >
    <SummaryCard label="Actividades esta semana" :value="summary.sessions" helper="Sesiones registradas" :icon="icons.activities.running" tone="emerald" />
    <SummaryCard label="Calorías quemadas" :value="`${summary.calories} kcal`" helper="Acumulado semanal" :icon="icons.common.calories" tone="amber" />
    <SummaryCard label="Tiempo total" :value="summary.formattedTime" helper="Actividad esta semana" :icon="icons.common.clock" tone="purple" />
    <SummaryCard label="Promedio por actividad" :value="`${summary.averageCalories} kcal`" helper="Media semanal" :icon="icons.common.trend" tone="blue" />
  </section>
</template>
