<script setup>
import { DatePicker } from "@/components/forms";
import { computed, onMounted, ref } from "vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useRecommendationStore } from "@/stores/recommendationStore";
import { useToastStore } from "@/stores/toastStore";
import RecommendationCard from "./components/RecommendationCard.vue";
import RecommendationResourceCard from "./components/RecommendationResourceCard.vue";
import { icons } from "@/icons";
import { todayLocalDate, formatDate } from "@/utils/dateUtils";

const recommendationStore = useRecommendationStore();
const toastStore = useToastStore();
const analysisDate = ref(todayLocalDate());

const analysisPeriod = computed(() => {
  const period = recommendationStore.period;
  if (!period?.from || !period?.to) return "";
  return `${formatDate(period.from)} – ${formatDate(period.to)}`;
});

const resources = computed(() => {
  const uniqueResources = new Map();

  recommendationStore.recommendations.forEach((recommendation) => {
    recommendation.resources?.forEach((resource) => {
      if (!uniqueResources.has(resource.code)) uniqueResources.set(resource.code, resource);
    });
  });

  return [...uniqueResources.values()];
});

const loadRecommendations = async (date = analysisDate.value) => {
  try {
    await recommendationStore.loadRecommendations(date);
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

onMounted(loadRecommendations);
</script>

<template>
  <section class="grid gap-7">
    <div class="flex items-end justify-between gap-6 max-[720px]:grid">
      <PageHeader
        eyebrow="Siguiente paso"
        title="Recomendaciones"
        description="Orientaciones personalizadas a partir de tus registros y objetivos."
      />
      <DatePicker
        id="recommendations-analysis-date"
        v-model="analysisDate"
        label="Fecha del análisis"
        :max="todayLocalDate()"
        class="w-64 shrink-0 max-[720px]:w-full"
        @update:model-value="loadRecommendations"
      />
    </div>

    <div
      v-if="analysisPeriod"
      class="-mt-4 flex w-fit items-center gap-2 rounded-lg bg-[#f7f1ec]/75 px-3 py-2 text-sm text-[#573e33]/60"
    >
      <component :is="icons.common.date" aria-hidden="true" class="size-4 text-[#9f756b]" />
      <span>Periodo analizado: <strong class="font-bold text-[#573e33]/80">{{ analysisPeriod }}</strong></span>
    </div>

    <LoadingState v-if="recommendationStore.isLoading" />

    <template v-else-if="recommendationStore.hasRecommendations">
      <section class="grid grid-cols-3 items-stretch gap-4 max-[1100px]:grid-cols-2 max-[720px]:grid-cols-1">
        <RecommendationCard v-for="recommendation in recommendationStore.recommendations" :key="recommendation.code" :recommendation="recommendation" />
      </section>

      <section v-if="resources.length" class="grid gap-4 border-t border-[#b98a81]/15 pt-6">
        <div>
          <h2 class="text-2xl font-extrabold text-[#573e33]">Recursos recomendados</h2>
          <p class="mt-1 text-sm text-[#573e33]/60">Contenido complementario para ayudarte a aplicar las recomendaciones.</p>
        </div>
        <div class="grid grid-cols-3 items-stretch gap-4 max-[1050px]:grid-cols-2 max-[680px]:grid-cols-1">
          <RecommendationResourceCard v-for="resource in resources" :key="resource.code" :resource="resource" />
        </div>
      </section>

      <aside class="flex items-center justify-between gap-6 rounded-xl bg-[#fbf5ef] px-6 py-4 text-[#573e33] max-[680px]:items-start max-[680px]:flex-col">
        <div class="flex min-w-0 items-center gap-4 max-[520px]:items-start">
          <component :is="icons.common.insight" aria-hidden="true" class="size-9 shrink-0 text-orange-500" />
          <div>
            <strong class="block">Pequeños cambios constantes generan grandes resultados.</strong>
            <p class="mt-1 text-sm text-[#573e33]/60">Sigue aplicando estas recomendaciones y revisa tu progreso cada semana.</p>
          </div>
        </div>

        <RouterLink
          :to="{ name: 'profile', hash: '#objetivos' }"
          class="flex h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-[#b98a81]/45 bg-white px-6 font-bold transition hover:border-[#8d5d50] hover:bg-[#fdfaf8] max-[680px]:w-full"
        >
          Ver mis objetivos
          <component :is="icons.actions.next" aria-hidden="true" class="size-4" />
        </RouterLink>
      </aside>
    </template>

    <EmptyState
      v-else-if="!recommendationStore.error"
      title="No hay recomendaciones para esta fecha"
      description="Registra alimentación, actividad o descanso y establece tus objetivos para recibir orientaciones personalizadas."
    />
    <EmptyState v-else title="No pudimos cargar las recomendaciones" :description="recommendationStore.error" />
  </section>
</template>
