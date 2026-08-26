<script setup>
import { computed, onMounted, ref, watch } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import SummaryCard from "@/components/ui/SummaryCard.vue";
import { DatePicker, Select } from "@/components/forms";
import { icons } from "@/icons";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { useToastStore } from "@/stores/toastStore";
import { todayLocalDate } from "@/utils/dateUtils";

const statisticsStore = useStatisticsStore();
const toastStore = useToastStore();
const period = ref("30");
const to = ref(todayLocalDate());

const periodOptions = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
];

const addDays = (value, amount) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const from = computed(() => addDays(to.value, -(Number(period.value) - 1)));
const summary = computed(() => statisticsStore.summary ?? {});
const trends = computed(() => statisticsStore.trends ?? {});
const round = (value, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
};

const summaryCards = computed(() => [
  {
    label: "Calorías promedio",
    value: `${round(summary.value.nutrition?.average_calories)} kcal`,
    helper: `${summary.value.nutrition?.days_recorded || 0} días registrados`,
    icon: icons.nutrition.calories,
    tone: "orange",
  },
  {
    label: "Actividad acumulada",
    value: `${round(summary.value.activity?.total_minutes)} min`,
    helper: `${summary.value.activity?.active_days || 0} días activos`,
    icon: icons.navigation.activity,
    tone: "emerald",
  },
  {
    label: "Sueño promedio",
    value: `${round(Number(summary.value.sleep?.average_duration_minutes) / 60)} h`,
    helper: `${summary.value.sleep?.nights_recorded || 0} noches registradas`,
    icon: icons.navigation.sleep,
    tone: "purple",
  },
  {
    label: "Cambio de peso",
    value:
      summary.value.weight?.weight_change == null
        ? "Sin datos"
        : `${round(summary.value.weight.weight_change)} kg`,
    helper: summary.value.weight?.latest_weight == null
      ? "Registra tu peso para ver la evolución"
      : `Último peso: ${round(summary.value.weight.latest_weight)} kg`,
    icon: icons.goals.weight,
    tone: "amber",
  },
]);

const chartDefinitions = computed(() => [
  {
    key: "nutrition",
    title: "Alimentación",
    unit: "kcal",
    color: "#ef5350",
    values: (trends.value.nutrition || []).map((item) => ({ date: item.date, value: item.calories })),
  },
  {
    key: "activity",
    title: "Actividad física",
    unit: "min",
    color: "#36a269",
    values: (trends.value.activity || []).map((item) => ({ date: item.date, value: item.minutes })),
  },
  {
    key: "sleep",
    title: "Sueño",
    unit: "h",
    color: "#7c63c9",
    values: (trends.value.sleep || []).map((item) => ({
      date: item.date,
      value: round(Number(item.duration_minutes) / 60),
    })),
  },
  {
    key: "weight",
    title: "Peso",
    unit: "kg",
    color: "#f59e0b",
    values: (trends.value.weight || []).map((item) => ({ date: item.date, value: item.weight })),
  },
]);

const chartPoints = (values) => {
  if (!values.length) return "";
  const numericValues = values.map((item) => Number(item.value || 0));
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min || 1;
  return values
    .map((item, index) => {
      const x = values.length === 1 ? 290 : 20 + (index * 540) / (values.length - 1);
      const y = 145 - ((Number(item.value || 0) - min) / range) * 110;
      return `${x},${y}`;
    })
    .join(" ");
};

const loadStatistics = async () => {
  try {
    await statisticsStore.loadStatistics({ from: from.value, to: to.value });
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

onMounted(loadStatistics);
watch([period, to], loadStatistics);
</script>

<template>
  <section class="grid gap-6 text-[#573e33]">
    <div class="flex items-end justify-between gap-6 max-[760px]:grid">
      <PageHeader
        eyebrow="Tu evolución"
        title="Progreso"
        description="Consulta cómo evolucionan tus hábitos a lo largo del tiempo."
      />
      <div class="grid w-[34rem] grid-cols-2 gap-3 max-[760px]:w-full max-[520px]:grid-cols-1">
        <Select id="progress-period" v-model="period" label="Periodo" :options="periodOptions" />
        <DatePicker id="progress-to" v-model="to" label="Hasta" :max="todayLocalDate()" />
      </div>
    </div>

    <LoadingState v-if="statisticsStore.isLoading" />
    <template v-else-if="statisticsStore.summary && statisticsStore.trends">
      <div class="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
        <SummaryCard v-for="card in summaryCards" :key="card.label" v-bind="card" />
      </div>

      <div class="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
        <BaseCard v-for="chart in chartDefinitions" :key="chart.key">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-extrabold">{{ chart.title }}</h2>
              <p class="text-xs text-[#573e33]/50">{{ from }} – {{ to }}</p>
            </div>
            <strong v-if="chart.values.length" class="text-sm">
              {{ round(chart.values.at(-1).value) }} {{ chart.unit }}
            </strong>
          </div>
          <svg v-if="chart.values.length" class="mt-4 h-44 w-full" viewBox="0 0 580 170" role="img" :aria-label="`Evolución de ${chart.title}`">
            <line v-for="y in [35, 72, 109, 145]" :key="y" x1="20" :y1="y" x2="560" :y2="y" stroke="#eadfda" stroke-dasharray="4 4" />
            <polyline :points="chartPoints(chart.values)" fill="none" :stroke="chart.color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div v-else class="grid h-44 place-items-center text-sm text-[#573e33]/50">Sin registros en este periodo</div>
        </BaseCard>
      </div>
    </template>
    <EmptyState v-else title="No pudimos cargar tu progreso" :description="statisticsStore.error || 'Inténtalo nuevamente.'" />
  </section>
</template>
