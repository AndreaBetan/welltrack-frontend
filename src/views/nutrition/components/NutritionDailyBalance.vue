<script setup>
import { DatePicker } from "@/components/forms";
import { round } from "@/utils/numberUtils";
import { computed } from "vue";
import { icons } from "@/icons";
import { todayLocalDate, toDateOnlyValue } from "@/utils/dateUtils";

defineOptions({ name: "NutritionDailyBalance" });

const props = defineProps({
  entries: { type: Array, required: true },
  goals: { type: Array, required: true },
  distributions: { type: Object, required: true },
});
const selectedDate = defineModel({ type: String, required: true });

const entriesForDate = computed(() =>
  props.entries.filter((entry) => toDateOnlyValue(entry.log_date) === selectedDate.value),
);
const total = (field) =>
  round(entriesForDate.value.reduce((sum, entry) => sum + Number(entry[field] || 0), 0));

const calorieGoal = computed(
  () =>
    props.goals
      .filter((goal) => {
      const startDate = toDateOnlyValue(goal.start_date);
      const endDate = goal.end_date ? toDateOnlyValue(goal.end_date) : null;
        return (
          goal.goal_type === "daily_calories" &&
          goal.status !== "cancelled" &&
          !goal.is_deleted &&
          (!startDate || selectedDate.value >= startDate) &&
          (!endDate || selectedDate.value <= endDate)
        );
      })
      .sort((first, second) =>
        String(second.start_date).localeCompare(String(first.start_date)),
      )[0],
);

const distribution = computed(() =>
  calorieGoal.value ? props.distributions[calorieGoal.value.id] : null,
);
const caloriesTarget = computed(() =>
  calorieGoal.value ? Number(calorieGoal.value.target_value) : null,
);
const macroTarget = (percentage, kcalPerGram) =>
  caloriesTarget.value != null && distribution.value
    ? round((caloriesTarget.value * Number(percentage)) / 100 / kcalPerGram)
    : null;

const nutrients = computed(() => {
  const definitions = [
    {
      id: "calories",
      label: "Calorías",
      field: "calories",
      unit: "kcal",
      target: caloriesTarget.value,
      icon: icons.nutrition.calories,
      iconClass: "bg-red-50 text-red-500",
      barClass: "bg-red-400",
      trackClass: "bg-red-100",
    },
    {
      id: "protein",
      label: "Proteína",
      field: "protein",
      unit: "g",
      target: macroTarget(distribution.value?.protein_percentage, 4),
      percentage: distribution.value?.protein_percentage,
      icon: icons.nutrition.protein,
      iconClass: "bg-emerald-50 text-emerald-600",
      barClass: "bg-emerald-500",
      trackClass: "bg-emerald-100",
    },
    {
      id: "carbs",
      label: "Carbohidratos",
      field: "carbs",
      unit: "g",
      target: macroTarget(distribution.value?.carbs_percentage, 4),
      percentage: distribution.value?.carbs_percentage,
      icon: icons.nutrition.carbs,
      iconClass: "bg-purple-50 text-purple-600",
      barClass: "bg-purple-500",
      trackClass: "bg-purple-100",
    },
    {
      id: "fat",
      label: "Grasas",
      field: "fat",
      unit: "g",
      target: macroTarget(distribution.value?.fat_percentage, 9),
      percentage: distribution.value?.fat_percentage,
      icon: icons.nutrition.fat,
      iconClass: "bg-orange-50 text-orange-500",
      barClass: "bg-orange-400",
      trackClass: "bg-orange-100",
    },
  ];

  return definitions.map((item) => {
    const consumed = total(item.field);
    const remaining = item.target == null ? null : round(item.target - consumed);
    const progress = item.target ? Math.round((consumed / item.target) * 100) : 0;
    return { ...item, consumed, remaining, progress };
  });
});

const calorieProgress = computed(() => nutrients.value[0]?.progress ?? 0);
const macros = computed(() => nutrients.value.filter((item) => item.id !== "calories"));
const donutStyle = computed(() => {
  if (!distribution.value) return { background: "#eee7e3" };
  const carbs = Number(distribution.value.carbs_percentage);
  const protein = Number(distribution.value.protein_percentage);
  return {
    background: `conic-gradient(#7c63c9 0 ${carbs}%, #36a269 ${carbs}% ${carbs + protein}%, #ff963d ${carbs + protein}% 100%)`,
  };
});
const formatValue = (value, unit) => `${round(value)} ${unit}`;
</script>

<template>
  <section class="grid gap-5">
    <div
      class="flex items-end justify-between gap-4 max-[640px]:items-stretch max-[640px]:flex-col"
    >
      <div>
        <h2 class="text-xl font-extrabold">Balance nutricional diario</h2>
        <p class="mt-1 text-sm text-[#573e33]/55">
          Totales, objetivo vigente y cantidad restante para la fecha seleccionada.
        </p>
      </div>
      <DatePicker
        id="nutrition-balance-date"
        v-model="selectedDate"
        label="Fecha del resumen"
        :max="todayLocalDate()"
        required
      />
    </div>

    <div class="grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[560px]:grid-cols-1">
      <article
        v-for="nutrient in nutrients"
        :key="nutrient.id"
        class="grid gap-3 rounded-xl border border-[#b98a81]/25 bg-white p-5"
      >
        <div class="flex items-center gap-3">
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full"
            :class="nutrient.iconClass"
            ><component :is="nutrient.icon" class="size-5" aria-hidden="true"
          /></span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold">{{ nutrient.label }}</h3>
            <strong class="block text-xl">{{
              formatValue(nutrient.consumed, nutrient.unit)
            }}</strong>
            <span class="text-xs text-[#573e33]/50">{{
              nutrient.target == null
                ? "Sin objetivo definido"
                : `de ${formatValue(nutrient.target, nutrient.unit)}`
            }}</span>
          </div>
        </div>
        <div v-if="nutrient.target != null" class="flex items-center gap-3">
          <div class="h-2 flex-1 overflow-hidden rounded-full" :class="nutrient.trackClass">
            <span
              class="block h-full rounded-full transition-all"
              :class="nutrient.barClass"
              :style="{ width: `${Math.min(Math.max(nutrient.progress, 0), 100)}%` }"
            />
          </div>
          <strong class="text-xs">{{ nutrient.progress }}%</strong>
        </div>
        <p
          v-if="nutrient.remaining != null"
          class="text-xs font-semibold"
          :class="nutrient.remaining >= 0 ? 'text-emerald-700' : 'text-orange-700'"
        >
          {{
            nutrient.remaining >= 0
              ? `Restan ${formatValue(nutrient.remaining, nutrient.unit)}`
              : `Excedido en ${formatValue(Math.abs(nutrient.remaining), nutrient.unit)}`
          }}
        </p>
      </article>
    </div>

    <div
      v-if="distribution"
      class="grid min-w-0 grid-cols-[200px_minmax(0,1fr)_210px] items-center gap-5 overflow-hidden rounded-xl border border-[#b98a81]/25 bg-white p-6 max-[1250px]:grid-cols-[180px_minmax(0,1fr)] max-[700px]:grid-cols-1 max-[520px]:p-4"
    >
      <div>
        <h3 class="mb-4 text-sm font-extrabold">Distribución de macronutrientes</h3>
        <div class="relative mx-auto size-36 rounded-full" :style="donutStyle">
          <div class="absolute inset-5 grid place-items-center rounded-full bg-white text-center">
            <div>
              <strong class="block text-xl">{{ calorieProgress }}%</strong
              ><span class="text-xs text-[#573e33]/50">del total</span>
            </div>
          </div>
        </div>
      </div>
      <div class="grid min-w-0 gap-2">
        <div
          v-for="macro in macros"
          :key="macro.id"
          class="grid grid-cols-[minmax(120px,1fr)_80px_60px_90px] items-center gap-3 border-b border-[#b98a81]/15 py-3 text-sm max-[560px]:grid-cols-[1fr_auto]"
        >
          <span class="flex items-center gap-2 font-semibold"
            ><i class="size-2.5 rounded-full" :class="macro.barClass" />{{ macro.label }}</span
          >
          <span class="max-[560px]:text-right">{{ formatValue(macro.consumed, macro.unit) }}</span>
          <strong class="max-[560px]:hidden">{{ round(macro.percentage) }}%</strong>
          <span class="text-[#573e33]/55 max-[560px]:hidden">{{
            formatValue(macro.target, macro.unit)
          }}</span>
        </div>
      </div>
      <aside
        class="rounded-xl bg-[#f7f1ec] p-4 text-sm max-[1250px]:col-span-2 max-[700px]:col-span-1"
      >
        <strong>¿Cómo se calcula?</strong>
        <p class="mt-2 text-xs leading-5 text-[#573e33]/60">
          Los gramos se calculan con 4 kcal por gramo de proteína o carbohidrato y 9 kcal por gramo
          de grasa.
        </p>
      </aside>
    </div>

    <div
      class="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 text-emerald-800"
    >
      <span class="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100"
        ><component :is="icons.actions.complete" class="size-5" aria-hidden="true"
      /></span>
      <div>
        <strong class="text-sm">{{
          entriesForDate.length ? "Continúa así" : "Vas bien encaminado"
        }}</strong>
        <p class="text-xs text-emerald-800/70">
          {{
            entriesForDate.length
              ? "Tu balance se actualiza con cada alimento registrado."
              : "Aún no has registrado alimentos en esta fecha. ¡Empieza a registrar tu comida!"
          }}
        </p>
      </div>
    </div>
  </section>
</template>
