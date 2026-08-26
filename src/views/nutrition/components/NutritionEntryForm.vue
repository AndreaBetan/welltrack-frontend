<script setup>
import { computed, reactive, watch } from "vue";
import { DatePicker } from "@/components/forms";
import { icons } from "@/icons";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({
  food: { type: Object, required: true },
  mealType: { type: String, default: "lunch" },
});
const emit = defineEmits(["saved", "cancel"]);
const nutritionStore = useNutritionStore();
const toastStore = useToastStore();

const localDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const form = reactive({
  meal_type: props.mealType,
  serving_grams: 100,
  description: "",
  log_date: localDate(),
});
const round = (value) => Math.round(value * 10) / 10;

const hasRequiredNutrition = computed(() =>
  ["calories100g", "protein100g", "carbs100g", "fat100g"].every((field) =>
    Number.isFinite(props.food[field]),
  ),
);
const totalServingGrams = computed(() => Number(form.serving_grams || 0));

// Calorie API entrega los macros por 100 g; la previsualización aplica la
// cantidad elegida sin consumir otra petición de la cuota.
const preview = computed(() => {
  const factor = totalServingGrams.value / 100;
  return {
    calories: round(props.food.calories100g * factor),
    protein: round(props.food.protein100g * factor),
    carbs: round(props.food.carbs100g * factor),
    fat: round(props.food.fat100g * factor),
  };
});

watch(
  () => props.food.externalId,
  () => {
    const defaultGrams = Number(props.food.servingSize ?? 100);
    form.serving_grams = defaultGrams;
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!hasRequiredNutrition.value) {
    toastStore.notify(
      "Este producto no tiene información nutricional suficiente. Búscalo por nombre.",
      "error",
    );
    return;
  }

  try {
    const commonData = {
      meal_type: form.meal_type,
      description: form.description.trim() || null,
      log_date: form.log_date,
    };

    if (props.food.sourceType === "barcode") {
      await nutritionStore.addEntryFromBarcode({
        ...commonData,
        barcode: props.food.barcode,
        serving_grams: totalServingGrams.value,
      });
    } else {
      await nutritionStore.addEntryFromFood({
        ...commonData,
        food_id: props.food.externalId,
        portion_grams: totalServingGrams.value,
        quantity: 1,
      });
    }
    toastStore.notify("Alimento registrado correctamente");
    emit("saved", form.log_date);
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <section class="min-w-0 rounded-xl border border-[#b98a81]/25 bg-[#fffdfc] p-5">
    <div class="flex items-start justify-between gap-4 border-b border-[#b98a81]/20 pb-5">
      <div class="min-w-0">
        <p class="text-sm font-extrabold">Alimento seleccionado</p>
        <h2 class="mt-2 min-w-0 truncate text-xl font-bold">{{ food.name }}</h2>
        <p v-if="food.brand" class="mt-1 text-sm text-[#573e33]/60">{{ food.brand }}</p>
        <p class="mt-2 text-xs text-[#573e33]/55">
          {{ food.calories100g }} kcal · P {{ food.protein100g }} g · C {{ food.carbs100g }} g · G {{ food.fat100g }} g / 100 g
        </p>
      </div>
      <button
        type="button"
        class="grid size-9 shrink-0 place-items-center rounded-lg text-[#a46f62] transition hover:bg-[#f7f1ec]"
        aria-label="Cambiar alimento"
        @click="emit('cancel')"
      >
        <component :is="icons.actions.edit" class="size-4" aria-hidden="true" />
      </button>
    </div>

    <form class="mt-5 grid min-w-0 grid-cols-2 gap-4 max-[640px]:grid-cols-1" @submit.prevent="handleSubmit">
      <fieldset class="col-span-2 grid min-w-0 gap-4 border-b border-[#b98a81]/20 pb-5 max-[640px]:col-span-1">
        <legend class="text-sm font-bold">Cantidad consumida</legend>
        <div>
          <label for="nutrition-serving-grams" class="mb-2 block text-xs font-semibold text-[#573e33]/65">Cantidad (g)</label>
          <div class="flex h-11 w-full min-w-0 items-center overflow-hidden rounded-lg border border-[#b98a81]/35 bg-white">
            <input
              id="nutrition-serving-grams"
              v-model="form.serving_grams"
              type="number"
              min="1"
              step="1"
              required
              class="h-full w-full min-w-0 flex-1 bg-white px-3 text-sm font-semibold outline-none"
              aria-label="Cantidad consumida en gramos"
            />
            <span class="grid h-full w-11 shrink-0 place-items-center border-l border-[#b98a81]/15 bg-[#f7f1ec] text-xs font-bold">g</span>
          </div>
        </div>

        <div>
          <input
            v-model="form.serving_grams"
            type="range"
            min="1"
            max="500"
            step="1"
            class="h-2 w-full cursor-pointer accent-[#573e33]"
            aria-label="Ajustar cantidad entre 1 y 500 gramos"
          />
          <div class="mt-1 flex justify-between text-[0.68rem] text-[#573e33]/45">
            <span>1 g</span>
            <span>500 g</span>
          </div>
          <p class="mt-2 text-xs text-[#573e33]/55">Total registrado: {{ round(totalServingGrams) }} g</p>
        </div>
      </fieldset>
      <DatePicker
        id="nutrition-log-date"
        v-model="form.log_date"
        label="Fecha"
        :max="localDate()"
        required
      />
      <label class="grid min-w-0 gap-2 text-sm font-semibold text-[#573e33]/75">
        Nota opcional
        <input v-model="form.description" type="text" maxlength="2000" placeholder="Ej. preparado a la plancha" class="h-11 w-full min-w-0 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15" />
      </label>

      <div class="col-span-2 grid grid-cols-4 gap-2 max-[700px]:grid-cols-2 max-[640px]:col-span-1">
        <div class="min-w-0 rounded-lg bg-orange-50/60 px-3 py-2">
          <span class="block text-[0.68rem] font-semibold text-[#573e33]/60">Calorías</span>
          <strong class="mt-0.5 block text-sm">{{ preview.calories }} kcal</strong>
        </div>
        <div class="min-w-0 rounded-lg bg-emerald-50/60 px-3 py-2">
          <span class="block text-[0.68rem] font-semibold text-[#573e33]/60">Proteína</span>
          <strong class="mt-0.5 block text-sm">{{ preview.protein }} g</strong>
        </div>
        <div class="min-w-0 rounded-lg bg-purple-50/60 px-3 py-2">
          <span class="block text-[0.68rem] font-semibold text-[#573e33]/60">Carbohidratos</span>
          <strong class="mt-0.5 block text-sm">{{ preview.carbs }} g</strong>
        </div>
        <div class="min-w-0 rounded-lg bg-amber-50/60 px-3 py-2">
          <span class="block text-[0.68rem] font-semibold text-[#573e33]/60">Grasas</span>
          <strong class="mt-0.5 block text-sm">{{ preview.fat }} g</strong>
        </div>
      </div>

      <p
        v-if="!hasRequiredNutrition"
        class="col-span-2 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 max-[640px]:col-span-1"
      >
        Este código no incluye todos los macronutrientes necesarios. Busca el alimento por nombre para registrarlo.
      </p>

      <button type="submit" :disabled="nutritionStore.isLoading || !hasRequiredNutrition" class="col-span-2 h-12 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:opacity-50 max-[640px]:col-span-1">
        {{ nutritionStore.isLoading ? "Guardando..." : "Registrar alimento" }}
      </button>
    </form>
  </section>
</template>
