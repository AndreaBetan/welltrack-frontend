<script setup>
import { computed } from "vue";
import MetricCard from "@/components/MetricCard.vue";
import PageHeader from "@/components/PageHeader.vue";
import { useActivityStore } from "@/stores/activityStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useSleepStore } from "@/stores/sleepStore";

const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();
const sleepStore = useSleepStore();

const wellnessIndex = computed(() => {
  const nutritionScore = nutritionStore.totalCaloriesToday > 0 && nutritionStore.totalCaloriesToday <= 2400 ? 30 : 16;
  const activityScore = Math.min(30, Math.round((activityStore.minutesToday / 45) * 30));
  const sleepScore = Math.min(40, Math.round((sleepStore.lastSleepHours / 8) * 40));
  return Math.max(0, Math.min(100, nutritionScore + activityScore + sleepScore));
});
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Resumen diario"
      title="Inicio"
      description="Consulta tus principales indicadores de bienestar personal en tiempo real."
    />

    <div class="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
      <MetricCard
        label="Calorias consumidas hoy"
        :value="`${nutritionStore.totalCaloriesToday} kcal`"
        :helper="`${nutritionStore.totalProteinToday} g de proteína registrados`"
      />
      <MetricCard
        label="Minutos de actividad"
        :value="`${activityStore.minutesToday} min`"
        :helper="`${activityStore.caloriesBurnedToday} kcal quemadas`"
      />
      <MetricCard
        label="Horas de sueño"
        :value="`${sleepStore.lastSleepHours} h`"
        :helper="sleepStore.lastEntry ? `${sleepStore.averageQuality}% de calidad media` : 'Sin registro reciente'"
      />
      <MetricCard
        label="Indice de bienestar"
        :value="`${wellnessIndex}%`"
        helper="Calculado con nutrición, actividad y descanso"
      />
    </div>
  </section>
</template>
