<script setup>
import { computed, onMounted } from "vue";
import MetricCard from "@/components/ui/MetricCard.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useActivityStore } from "@/stores/activityStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useSleepStore } from "@/stores/sleepStore";

const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();
const sleepStore = useSleepStore();

const localDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Tras recargar el navegador, el dashboard consulta los registros del día en
// PostgreSQL; ya no depende de la antigua copia en localStorage.
onMounted(() => nutritionStore.loadEntries({ date: localDate() }).catch(() => {}));

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
