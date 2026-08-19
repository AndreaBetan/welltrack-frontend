<script setup>
import { computed } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useActivityStore } from "@/stores/activityStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useSleepStore } from "@/stores/sleepStore";

const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();
const sleepStore = useSleepStore();

const recommendations = computed(() => {
  const items = [];

  if (!sleepStore.lastEntry || sleepStore.lastSleepHours < 7) {
    items.push({
      category: "Sueño",
      title: "Prioriza una noche mas larga",
      description: "Tu descanso reciente esta por debajo de 7 horas. Adelanta la rutina nocturna y reduce pantallas antes de dormir.",
    });
  }

  if (activityStore.minutesToday < 30) {
    items.push({
      category: "Actividad física",
      title: "Completa movimiento suave",
      description: "Hoy llevas poca actividad. Una caminata de 20 a 30 minutos ayudaría a estabilizar energía y recuperación.",
    });
  }

  if (nutritionStore.totalCaloriesToday > 2400) {
    items.push({
      category: "Alimentación",
      title: "Equilibra la próxima comida",
      description: "El consumo calórico de hoy esta alto. Prioriza verduras, proteína magra y una cena ligera.",
    });
  }

  if (!items.length && (nutritionStore.entries.length || activityStore.entries.length || sleepStore.entries.length)) {
    items.push({
      category: "Bienestar",
      title: "Mantener consistencia",
      description: "Tus indicadores actuales estan en buen rango. Mantener horarios, movimiento y comidas regulares es el siguiente paso.",
    });
  }

  return items;
});
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Siguiente paso"
      title="Recomendaciones"
      description="Sugerencias automáticas basadas en alimentación, actividad física y descanso."
    />

    <section v-if="recommendations.length" class="grid gap-4">
      <BaseCard v-for="item in recommendations" :key="item.title">
        <span class="text-xs font-extrabold uppercase tracking-[0.12em] text-[#b98a81]">
          {{ item.category }}
        </span>
        <h2 class="mt-2 text-2xl font-bold text-[#573e33]">{{ item.title }}</h2>
        <p class="mt-2 leading-relaxed text-[#573e33]/72">{{ item.description }}</p>
      </BaseCard>
    </section>

    <EmptyState
      v-else
      title="Aun no hay datos suficientes"
      description="Registra alimentación, actividad o descanso para generar recomendaciones personalizadas."
    />
  </section>
</template>
