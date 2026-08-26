<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import BaseCard from "@/components/ui/BaseCard.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { DatePicker } from "@/components/forms";
import { icons } from "@/icons";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useToastStore } from "@/stores/toastStore";
import { todayLocalDate } from "@/utils/dateUtils";

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const toastStore = useToastStore();
const selectedDate = ref(todayLocalDate());
const data = computed(() => dashboardStore.snapshot ?? {});
const firstName = computed(() => authStore.user?.name?.trim().split(/\s+/)[0] || "Hola");
const round = (value) => Math.round(Number(value || 0) * 10) / 10;
const percent = (value, target) => target > 0 ? Math.round((Number(value || 0) / target) * 100) : 0;
const goal = (type) => data.value.active_goals?.find((item) => item.goal_type === type);

const calorieTarget = computed(() => Number(goal("daily_calories")?.target_value || 0));
const activityTarget = computed(() => Number(goal("daily_activity_minutes")?.target_value || 0));
const sleepTarget = computed(() => Number(goal("nightly_sleep_hours")?.target_value || 0));
const calories = computed(() => round(data.value.nutrition?.calories));
const activity = computed(() => round(data.value.activity?.minutes));
const sleep = computed(() => round(Number(data.value.sleep?.duration_minutes || 0) / 60));
const wellness = computed(() => data.value.wellness_index ?? {});

const labels = {
  excellent: "Excelente progreso", good: "Buen progreso", in_progress: "En progreso",
  needs_attention: "Necesita atención", insufficient_data: "Faltan registros",
};
const metrics = computed(() => [
  { label: "Calorías consumidas", value: `${calories.value} kcal`, target: calorieTarget.value, unit: "kcal", progress: percent(calories.value, calorieTarget.value), icon: icons.nutrition.calories, tone: "red" },
  { label: "Minutos de actividad", value: `${activity.value} min`, target: activityTarget.value, unit: "min", progress: percent(activity.value, activityTarget.value), icon: icons.goals.activity, tone: "emerald" },
  { label: "Horas de sueño", value: `${sleep.value} h`, target: sleepTarget.value, unit: "h", progress: percent(sleep.value, sleepTarget.value), icon: icons.goals.sleep, tone: "purple" },
  { label: "Índice de hábitos", value: wellness.value.score == null ? "—" : `${wellness.value.score}%`, helper: `${labels[wellness.value.label] || "Sin datos"}${wellness.value.is_provisional ? " · provisional" : ""}`, progress: wellness.value.score || 0, icon: icons.common.trend, tone: "orange" },
]);
const toneClasses = {
  red: ["bg-red-50 text-red-500", "bg-red-100", "bg-red-400"],
  emerald: ["bg-emerald-50 text-emerald-700", "bg-emerald-100", "bg-emerald-500"],
  purple: ["bg-purple-50 text-purple-700", "bg-purple-100", "bg-purple-500"],
  orange: ["bg-orange-50 text-orange-600", "bg-orange-100", "bg-orange-400"],
};

const dailyRows = computed(() => [
  { label: "Alimentación", value: `${calories.value} kcal`, detail: `${data.value.nutrition?.entries_count || 0} alimentos`, to: "/alimentacion", icon: icons.navigation.nutrition, style: "bg-red-50 text-red-500" },
  { label: "Actividad física", value: `${activity.value} min`, detail: `${data.value.activity?.entries_count || 0} sesiones`, to: "/actividad-fisica", icon: icons.navigation.activity, style: "bg-emerald-50 text-emerald-700" },
  { label: "Sueño", value: `${sleep.value} h`, detail: data.value.sleep ? `${data.value.sleep.sleep_quality}/5 de calidad` : "Sin registro", to: "/sueno", icon: icons.navigation.sleep, style: "bg-purple-50 text-purple-700" },
  { label: "Peso", value: data.value.weight?.current_weight ? `${round(data.value.weight.current_weight)} kg` : "Sin datos", detail: data.value.weight?.weight_date ? `Medición: ${data.value.weight.weight_date}` : "Dato no registrado", to: "/perfil", icon: icons.goals.weight, style: "bg-orange-50 text-orange-600" },
]);

const presentation = {
  nutrition: ["/alimentacion", icons.navigation.nutrition, "bg-orange-50 text-orange-600"],
  activity: ["/actividad-fisica", icons.navigation.activity, "bg-emerald-50 text-emerald-700"],
  sleep: ["/sueno", icons.navigation.sleep, "bg-purple-50 text-purple-700"],
  wellbeing: ["/recomendaciones", icons.navigation.recommendations, "bg-rose-50 text-rose-600"],
};
const recommendations = computed(() => (data.value.recommendations?.items || []).map((item) => {
  const config = presentation[item.category] || presentation.wellbeing;
  return { ...item, to: item.code === "SET_WELLBEING_GOALS" ? "/perfil" : config[0], icon: config[1], style: config[2] };
}));
const alerts = computed(() => recommendations.value.filter((item) => ["priority", "high"].includes(item.priority)));

const load = async () => {
  try { await dashboardStore.loadDashboard(selectedDate.value); }
  catch (error) { toastStore.notify(error.message, "error"); }
};
onMounted(load);
watch(selectedDate, load);
</script>

<template>
  <section class="grid gap-5 text-[#573e33]">
    <div class="flex items-end justify-between gap-6 max-[680px]:grid">
      <header><h1 class="text-3xl font-extrabold">¡Hola, {{ firstName }}! 👋</h1><p class="mt-1 text-sm text-[#573e33]/60">Aquí tienes un resumen de tu bienestar.</p></header>
      <DatePicker id="dashboard-date" v-model="selectedDate" label="Fecha del resumen" :max="todayLocalDate()" class="w-60 max-[680px]:w-full" />
    </div>

    <LoadingState v-if="dashboardStore.isLoading && !dashboardStore.snapshot" />
    <template v-else>
      <RouterLink v-if="alerts.length" to="/recomendaciones" class="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 hover:bg-amber-100/70">
        <span class="grid size-11 place-items-center rounded-full bg-white text-amber-600"><component :is="icons.common.warning" class="size-5" /></span>
        <span class="min-w-0 flex-1"><strong class="block">Tienes {{ alerts.length }} recomendación prioritaria</strong><small class="line-clamp-1 text-[#573e33]/60">{{ alerts[0].title }}</small></span><component :is="icons.actions.next" class="size-4" />
      </RouterLink>

      <div class="grid grid-cols-4 gap-4 max-[1150px]:grid-cols-2 max-[600px]:grid-cols-1">
        <article v-for="metric in metrics" :key="metric.label" class="grid gap-4 rounded-xl border border-[#b98a81]/25 bg-white p-5">
          <div class="flex items-center gap-4"><span class="grid size-12 place-items-center rounded-full" :class="toneClasses[metric.tone][0]"><component :is="metric.icon" class="size-6" /></span><div><p class="text-xs font-extrabold uppercase text-[#8d5d50]">{{ metric.label }}</p><strong class="mt-1 block text-2xl">{{ metric.value }}</strong><span class="text-xs text-[#573e33]/55">{{ metric.helper || (metric.target ? `de ${metric.target} ${metric.unit}` : "Sin objetivo") }}</span></div></div>
          <div class="flex items-center gap-3"><div class="h-2 flex-1 rounded-full" :class="toneClasses[metric.tone][1]"><span class="block h-full rounded-full" :class="toneClasses[metric.tone][2]" :style="{ width: `${Math.min(metric.progress, 100)}%` }" /></div><strong class="text-xs">{{ metric.progress }}%</strong></div>
        </article>
      </div>

      <div class="grid grid-cols-[0.9fr_1.1fr] gap-4 max-[980px]:grid-cols-1">
        <BaseCard><h2 class="mb-4 text-xl font-extrabold">Resumen del día</h2><div class="divide-y divide-[#b98a81]/15"><RouterLink v-for="item in dailyRows" :key="item.label" :to="item.to" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span class="grid size-10 place-items-center rounded-full" :class="item.style"><component :is="item.icon" class="size-5" /></span><span class="min-w-0 flex-1"><strong class="block text-sm">{{ item.label }}</strong><small class="text-[#573e33]/55">{{ item.detail }}</small></span><strong class="text-sm">{{ item.value }}</strong><component :is="icons.actions.next" class="size-4" /></RouterLink></div></BaseCard>
        <BaseCard><h2 class="text-xl font-extrabold">Tu bienestar en foco</h2><p class="mt-1 text-xs text-[#573e33]/50">Basado en los 7 días completos anteriores</p><div v-if="recommendations.length" class="mt-4 divide-y divide-[#b98a81]/15"><RouterLink v-for="item in recommendations" :key="item.code" :to="item.to" class="flex items-center gap-3 py-4 first:pt-0"><span class="grid size-10 place-items-center rounded-full" :class="item.style"><component :is="item.icon" class="size-5" /></span><span class="min-w-0 flex-1"><strong class="block text-sm">{{ item.title }}</strong><small class="line-clamp-2 text-[#573e33]/55">{{ item.description }}</small></span><component :is="icons.actions.next" class="size-4" /></RouterLink></div><p v-else class="mt-5 text-sm text-[#573e33]/55">Registra tus hábitos para recibir recomendaciones.</p></BaseCard>
      </div>

      <BaseCard><div class="flex items-center justify-between gap-6 max-[560px]:items-start max-[560px]:flex-col"><div><h2 class="text-xl font-extrabold">Consulta tu evolución</h2><p class="mt-1 text-sm text-[#573e33]/55">Explora las tendencias de alimentación, actividad, sueño y peso.</p></div><RouterLink to="/progreso" class="flex h-11 items-center gap-3 rounded-lg border border-[#b98a81]/40 px-5 font-bold hover:bg-[#f7f1ec]">Ver progreso <component :is="icons.actions.next" class="size-4" /></RouterLink></div></BaseCard>
      <p class="rounded-xl bg-[#f7f1ec] px-4 py-3 text-center text-xs text-[#573e33]/55">{{ wellness.disclaimer || "Los datos se actualizan automáticamente." }}</p>
    </template>
  </section>
</template>
