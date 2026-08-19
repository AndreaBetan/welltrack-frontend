<script setup>
import { reactive, ref } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { ConfirmModal } from "@/components/modals";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";

const nutritionStore = useNutritionStore();
const toastStore = useToastStore();
const editingId = ref(null);
const pendingDeleteId = ref(null);
const isDeleting = ref(false);

const mealLabels = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snack: "Tentempié",
};

const form = reactive({
  meal_type: "",
  food_name: "",
  serving_grams: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  description: "",
  log_date: "",
});

const startEditing = (entry) => {
  editingId.value = entry.id;
  Object.assign(form, {
    meal_type: entry.meal_type,
    food_name: entry.food_name,
    serving_grams: Number(entry.serving_grams),
    calories: Number(entry.calories),
    protein: Number(entry.protein),
    carbs: Number(entry.carbs),
    fat: Number(entry.fat),
    description: entry.description ?? "",
    log_date: String(entry.log_date).slice(0, 10),
  });
};

const saveEntry = async (entry) => {
  try {
    await nutritionStore.updateEntry(entry.id, {
      meal_type: form.meal_type,
      food_name: form.food_name.trim(),
      serving_grams: Number(form.serving_grams),
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      description: form.description.trim() || null,
      log_date: form.log_date,
      // Se conservan los datos de procedencia que no se editan visualmente.
      data_source: entry.data_source,
      external_food_id: entry.external_food_id,
      brand: entry.brand,
    });
    editingId.value = null;
    toastStore.notify("Registro nutricional actualizado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const removeEntry = async () => {
  const entryId = pendingDeleteId.value;
  if (!entryId) return;

  isDeleting.value = true;
  try {
    await nutritionStore.deleteEntry(entryId);
    pendingDeleteId.value = null;
    toastStore.notify("Registro nutricional eliminado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <LoadingState v-if="nutritionStore.isLoading && !nutritionStore.entries.length" />

  <div v-else-if="nutritionStore.entries.length" class="grid gap-4">
    <BaseCard v-for="entry in nutritionStore.entries" :key="entry.id">
      <form
        v-if="editingId === entry.id"
        class="grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1"
        @submit.prevent="saveEntry(entry)"
      >
        <label class="grid gap-2 text-sm font-semibold">Alimento<input v-model="form.food_name" required maxlength="200" class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Comida<select v-model="form.meal_type" required class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3"><option value="breakfast">Desayuno</option><option value="lunch">Almuerzo</option><option value="dinner">Cena</option><option value="snack">Tentempié</option></select></label>
        <label class="grid gap-2 text-sm font-semibold">Cantidad (g)<input v-model="form.serving_grams" type="number" min="0.1" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Fecha<input v-model="form.log_date" type="date" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Calorías<input v-model="form.calories" type="number" min="0" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Proteína (g)<input v-model="form.protein" type="number" min="0" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Carbohidratos (g)<input v-model="form.carbs" type="number" min="0" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="grid gap-2 text-sm font-semibold">Grasas (g)<input v-model="form.fat" type="number" min="0" step="0.1" required class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <label class="col-span-4 grid gap-2 text-sm font-semibold max-[1000px]:col-span-2 max-[640px]:col-span-1">Nota<input v-model="form.description" maxlength="2000" class="h-11 rounded-lg border border-[#b98a81]/35 px-3" /></label>
        <div class="col-span-4 flex gap-2 max-[1000px]:col-span-2 max-[640px]:col-span-1 max-[420px]:flex-col">
          <button type="submit" :disabled="nutritionStore.isLoading" class="h-11 rounded-lg bg-[#573e33] px-5 font-bold text-white disabled:opacity-50">Guardar cambios</button>
          <button type="button" :disabled="nutritionStore.isLoading" class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold" @click="editingId = null">Cancelar</button>
        </div>
      </form>

      <div v-else class="flex items-start justify-between gap-4 max-[720px]:flex-col">
        <div>
          <span class="text-xs font-extrabold uppercase tracking-[0.1em] text-[#b98a81]">
            {{ mealLabels[entry.meal_type] ?? entry.meal_type }} · {{ String(entry.log_date).slice(0, 10) }}
          </span>
          <h3 class="mt-1 text-xl font-bold">{{ entry.food_name }}</h3>
          <p class="mt-1 text-sm text-[#573e33]/60">
            {{ entry.serving_grams }} g<span v-if="entry.brand"> · {{ entry.brand }}</span>
          </p>
          <p class="mt-3 text-sm text-[#573e33]/75">
            {{ entry.calories }} kcal · {{ entry.protein }} g proteína · {{ entry.carbs }} g carbohidratos · {{ entry.fat }} g grasa
          </p>
          <p v-if="entry.description" class="mt-2 text-sm italic text-[#573e33]/60">{{ entry.description }}</p>
        </div>
        <div class="flex flex-wrap gap-2 max-[420px]:w-full">
          <button type="button" class="rounded-lg border border-[#b98a81]/35 px-4 py-2 text-sm font-bold max-[420px]:flex-1" @click="startEditing(entry)">Editar</button>
          <button type="button" class="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 max-[420px]:flex-1" @click="pendingDeleteId = entry.id">Eliminar</button>
        </div>
      </div>
    </BaseCard>
  </div>

  <EmptyState v-else title="Todavía no hay registros" description="Busca un alimento y registra la cantidad consumida." />

  <ConfirmModal
    :open="Boolean(pendingDeleteId)"
    title="Eliminar registro nutricional"
    message="Esta acción eliminará el alimento registrado y actualizará tus totales diarios. ¿Quieres continuar?"
    confirm-label="Eliminar"
    :loading="isDeleting"
    destructive
    @update:open="pendingDeleteId = null"
    @confirm="removeEntry"
  />
</template>
