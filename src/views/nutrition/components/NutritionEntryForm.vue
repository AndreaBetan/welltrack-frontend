<script setup>
import { computed, reactive, watch } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({ food: { type: Object, required: true } });
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

const form = reactive({ meal_type: "lunch", serving_grams: 100, description: "", log_date: localDate() });
const round = (value) => Math.round(value * 10) / 10;

// USDA se normaliza por 100 g; la previsualización aplica la cantidad elegida.
const preview = computed(() => {
  const factor = Number(form.serving_grams || 0) / 100;
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
    form.serving_grams =
      props.food.servingSize && String(props.food.servingSizeUnit).toLowerCase() === "g"
        ? Number(props.food.servingSize)
        : 100;
  },
  { immediate: true },
);

const handleSubmit = async () => {
  try {
    await nutritionStore.addEntry({
      data_source: "usda",
      external_food_id: props.food.externalId,
      food_name: props.food.name,
      brand: props.food.brand,
      meal_type: form.meal_type,
      serving_grams: Number(form.serving_grams),
      description: form.description.trim() || null,
      calories: preview.value.calories,
      protein: preview.value.protein,
      carbs: preview.value.carbs,
      fat: preview.value.fat,
      log_date: form.log_date,
    });
    toastStore.notify("Alimento registrado correctamente");
    emit("saved");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <BaseCard>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-extrabold uppercase tracking-[0.1em] text-[#b98a81]">Alimento seleccionado</p>
        <h2 class="mt-1 text-xl font-bold">{{ food.name }}</h2>
        <p v-if="food.brand" class="mt-1 text-sm text-[#573e33]/60">{{ food.brand }}</p>
      </div>
      <button type="button" class="rounded-lg px-3 py-2 text-sm font-bold" @click="emit('cancel')">
        Cambiar
      </button>
    </div>

    <form class="mt-5 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1" @submit.prevent="handleSubmit">
      <label class="grid gap-2 text-sm font-semibold">
        Tipo de comida
        <select v-model="form.meal_type" class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3" required>
          <option value="breakfast">Desayuno</option>
          <option value="lunch">Almuerzo</option>
          <option value="dinner">Cena</option>
          <option value="snack">Tentempié</option>
        </select>
      </label>
      <label class="grid gap-2 text-sm font-semibold">
        Cantidad (g)
        <input v-model="form.serving_grams" type="number" min="0.1" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" />
      </label>
      <label class="grid gap-2 text-sm font-semibold">
        Fecha
        <input v-model="form.log_date" type="date" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" />
      </label>
      <label class="grid gap-2 text-sm font-semibold">
        Nota opcional
        <input v-model="form.description" type="text" maxlength="2000" placeholder="Ej. preparado a la plancha" class="h-11 rounded-lg border border-[#b98a81]/35 px-3" />
      </label>

      <div class="col-span-2 grid grid-cols-4 gap-3 rounded-lg bg-[#f7f1ec] p-4 max-[700px]:grid-cols-2 max-[640px]:col-span-1">
        <div><span class="block text-xs text-[#573e33]/55">Calorías</span><strong>{{ preview.calories }} kcal</strong></div>
        <div><span class="block text-xs text-[#573e33]/55">Proteína</span><strong>{{ preview.protein }} g</strong></div>
        <div><span class="block text-xs text-[#573e33]/55">Carbohidratos</span><strong>{{ preview.carbs }} g</strong></div>
        <div><span class="block text-xs text-[#573e33]/55">Grasas</span><strong>{{ preview.fat }} g</strong></div>
      </div>

      <button type="submit" :disabled="nutritionStore.isLoading" class="col-span-2 h-11 rounded-lg bg-[#573e33] font-bold text-white disabled:opacity-50 max-[640px]:col-span-1">
        {{ nutritionStore.isLoading ? "Guardando..." : "Registrar alimento" }}
      </button>
    </form>
  </BaseCard>
</template>
