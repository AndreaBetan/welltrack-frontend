<script setup>
import { computed, onMounted, ref } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import FoodSearch from "./components/FoodSearch.vue";
import MealEntries from "./components/MealEntries.vue";
import NutritionDailyBalance from "./components/NutritionDailyBalance.vue";
import NutritionEntryForm from "./components/NutritionEntryForm.vue";
import { useGoalStore } from "@/stores/goalStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";
import { icons } from "@/icons";
import { todayLocalDate } from "@/utils/dateUtils";

const nutritionStore = useNutritionStore();
const goalStore = useGoalStore();
const toastStore = useToastStore();
const selectedFood = ref(null);
const selectedMeal = ref(null);
const selectedBalanceDate = ref(todayLocalDate());

const meals = [
  { value: "breakfast", label: "Desayuno", icon: icons.nutrition.breakfast, style: "bg-amber-50 text-amber-700", selectedStyle: "border-amber-500 ring-amber-500/10", selectedIcon: "text-amber-600" },
  { value: "lunch", label: "Almuerzo", icon: icons.nutrition.lunch, style: "bg-emerald-50 text-emerald-700", selectedStyle: "border-emerald-500 ring-emerald-500/10", selectedIcon: "text-emerald-600" },
  { value: "dinner", label: "Cena", icon: icons.nutrition.dinner, style: "bg-purple-50 text-purple-700", selectedStyle: "border-purple-500 ring-purple-500/10", selectedIcon: "text-purple-600" },
  { value: "snack", label: "Snacks", icon: icons.nutrition.snack, style: "bg-orange-50 text-orange-700", selectedStyle: "border-orange-500 ring-orange-500/10", selectedIcon: "text-orange-600" },
];

const mealSummary = computed(() =>
  Object.fromEntries(
    meals.map((meal) => {
      const entries = nutritionStore.todayEntries.filter((entry) => entry.meal_type === meal.value);
      return [
        meal.value,
        {
          count: entries.length,
          calories: Math.round(
            entries.reduce((total, entry) => total + Number(entry.calories || 0), 0),
          ),
        },
      ];
    }),
  ),
);
const selectedMealEntries = computed(() =>
  selectedMeal.value
    ? nutritionStore.todayEntries.filter((entry) => entry.meal_type === selectedMeal.value)
    : [],
);

const openMealSearch = (mealType) => {
  selectedMeal.value = mealType;
  selectedFood.value = null;
};

const closeMealSearch = () => {
  selectedMeal.value = null;
  selectedFood.value = null;
};

const handleEntrySaved = (logDate) => {
  selectedBalanceDate.value = logDate;
  closeMealSearch();
};

onMounted(async () => {
  try {
    await Promise.all([
      nutritionStore.loadEntries(),
      goalStore.goals.length ? Promise.resolve() : goalStore.loadGoals(),
    ]);
    await goalStore.loadNutritionDistributions();
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
    />

    <BaseCard>
      <section class="grid gap-3">
      <div>
        <h2 class="text-xl font-extrabold">Registrar comida</h2>
        <p class="mt-1 text-sm text-[#573e33]/55">Selecciona el momento del día para añadir un alimento.</p>
      </div>

      <div class="flex items-center gap-3 overflow-x-auto py-2 text-xs font-semibold text-[#573e33]/55">
        <div class="flex shrink-0 items-center gap-2" :class="selectedMeal ? 'text-emerald-700' : 'text-[#573e33]'">
          <span class="grid size-8 place-items-center rounded-full" :class="selectedMeal ? 'bg-emerald-50' : 'bg-[#f7f1ec]'">
            <component v-if="selectedMeal" :is="icons.actions.complete" class="size-4" aria-hidden="true" />
            <span v-else>1</span>
          </span>
          Seleccionar momento
        </div>
        <span class="h-px min-w-8 flex-1 bg-[#b98a81]/30" />
        <div class="flex shrink-0 items-center gap-2" :class="selectedMeal && !selectedFood ? 'font-extrabold text-[#573e33]' : ''">
          <span class="grid size-8 place-items-center rounded-full" :class="selectedMeal && !selectedFood ? 'bg-[#573e33] text-white' : 'bg-[#f7f1ec]'">2</span>
          Buscar alimento
        </div>
        <span class="h-px min-w-8 flex-1 bg-[#b98a81]/30" />
        <div class="flex shrink-0 items-center gap-2" :class="selectedFood ? 'font-extrabold text-[#573e33]' : ''">
          <span class="grid size-8 place-items-center rounded-full" :class="selectedFood ? 'bg-[#573e33] text-white' : 'bg-[#f7f1ec]'">3</span>
          Detalles y cantidad
        </div>
        <span class="h-px min-w-8 flex-1 bg-[#b98a81]/30" />
        <div class="flex shrink-0 items-center gap-2">
          <span class="grid size-8 place-items-center rounded-full bg-[#f7f1ec]">4</span>
          Registrar
        </div>
      </div>

        <div class="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        <button
          v-for="meal in meals"
          :key="meal.value"
          type="button"
          class="flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#b98a81] hover:shadow-sm"
          :class="selectedMeal === meal.value ? `${meal.selectedStyle} ring-4` : 'border-[#b98a81]/25'"
          @click="openMealSearch(meal.value)"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-full" :class="meal.style">
            <component :is="meal.icon" class="size-5" aria-hidden="true" />
          </span>
          <span class="min-w-0 flex-1">
            <strong class="block">{{ meal.label }}</strong>
            <small class="mt-0.5 block text-[#573e33]/55">
              {{ mealSummary[meal.value].calories }} kcal · {{ mealSummary[meal.value].count }}
              {{ mealSummary[meal.value].count === 1 ? "alimento" : "alimentos" }}
            </small>
          </span>
          <component
            :is="selectedMeal === meal.value ? icons.actions.complete : icons.actions.add"
            class="size-5 shrink-0"
            :class="selectedMeal === meal.value ? meal.selectedIcon : 'text-[#b98a81]'"
            aria-hidden="true"
          />
          </button>
        </div>

        <MealEntries :entries="selectedMealEntries" />
      </section>

      <div v-if="selectedMeal" class="mt-6 border-t border-[#b98a81]/20 pt-6">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold">
            Añadir a {{ meals.find((meal) => meal.value === selectedMeal)?.label }}
          </h2>
          <p class="mt-1 text-sm text-[#573e33]/55">
            Busca y selecciona el alimento que has consumido.
          </p>
        </div>
        <button
          type="button"
          class="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-[#573e33]/65 transition hover:bg-[#f7f1ec] hover:text-[#573e33]"
          @click="closeMealSearch"
        >
          Cerrar
          <component :is="icons.actions.close" class="size-4" aria-hidden="true" />
        </button>
      </div>

      <div class="grid grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] gap-4 max-[1000px]:grid-cols-1">
        <FoodSearch
          :key="selectedMeal"
          auto-open
          :selected-id="selectedFood?.externalId"
          @select="selectedFood = $event"
        />

        <NutritionEntryForm
          v-if="selectedFood"
          :food="selectedFood"
          :meal-type="selectedMeal"
          @cancel="selectedFood = null"
          @saved="handleEntrySaved"
        />
        <div
          v-else
          class="grid min-h-[300px] place-items-center rounded-xl border border-dashed border-[#b98a81]/35 bg-[#fffdfc] p-8 text-center"
        >
          <div>
            <span class="mx-auto grid size-12 place-items-center rounded-full bg-[#f7f1ec] text-[#b98a81]">
              <component :is="icons.navigation.nutrition" class="size-6" aria-hidden="true" />
            </span>
            <strong class="mt-3 block">Selecciona un alimento</strong>
            <p class="mt-1 max-w-xs text-sm text-[#573e33]/55">
              Aquí podrás elegir la cantidad, la fecha y consultar los nutrientes calculados.
            </p>
          </div>
        </div>
      </div>
      </div>
    </BaseCard>

    <NutritionDailyBalance
      v-model="selectedBalanceDate"
      :entries="nutritionStore.entries"
      :goals="goalStore.goals"
      :distributions="goalStore.nutritionDistributions"
    />

  </section>
</template>
