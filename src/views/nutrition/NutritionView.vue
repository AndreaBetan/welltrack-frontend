<script setup>
import { computed, onMounted, ref } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import MetricCard from "@/components/ui/MetricCard.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import FoodSearch from "./components/FoodSearch.vue";
import NutritionEntryForm from "./components/NutritionEntryForm.vue";
import NutritionLogsList from "./components/NutritionLogsList.vue";
import { useGoalStore } from "@/stores/goalStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";

const nutritionStore = useNutritionStore();
const goalStore = useGoalStore();
const toastStore = useToastStore();
const selectedFood = ref(null);

const calorieGoal = computed(() =>
  goalStore.goals.find(
    (goal) => goal.goal_type === "daily_calories" && goal.status === "active",
  ),
);

const calorieProgress = computed(() => {
  const target = Number(calorieGoal.value?.target_value || 0);
  if (!target) return null;
  return Math.round((nutritionStore.totalCaloriesToday / target) * 100);
});

onMounted(async () => {
  try {
    await Promise.all([
      nutritionStore.loadEntries(),
      goalStore.goals.length ? Promise.resolve() : goalStore.loadGoals(),
    ]);
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
});
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Nutrición"
      title="Alimentación"
      description="Busca alimentos, ajusta la cantidad consumida y consulta tus macronutrientes diarios."
    />

    <div class="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
      <MetricCard
        label="Calorías hoy"
        :value="`${nutritionStore.totalCaloriesToday} kcal`"
        :helper="calorieProgress === null ? 'Sin objetivo calórico activo' : `${calorieProgress}% de tu objetivo`"
      />
      <MetricCard label="Proteína" :value="`${nutritionStore.totalProteinToday} g`" helper="Acumulado de hoy" />
      <MetricCard label="Carbohidratos" :value="`${nutritionStore.totalCarbsToday} g`" helper="Acumulado de hoy" />
      <MetricCard label="Grasas" :value="`${nutritionStore.totalFatToday} g`" helper="Acumulado de hoy" />
    </div>

    <BaseCard v-if="!selectedFood">
      <FoodSearch @select="selectedFood = $event" />
    </BaseCard>

    <NutritionEntryForm
      v-else
      :food="selectedFood"
      @cancel="selectedFood = null"
      @saved="selectedFood = null"
    />

    <section class="grid gap-4">
      <h2 class="text-2xl font-bold">Historial de alimentación</h2>
      <NutritionLogsList />
    </section>
  </section>
</template>
