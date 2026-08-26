<script setup>
import { reactive, ref } from "vue";
import { DatePicker } from "@/components/forms";
import FormField from "@/components/forms/FormField.vue";
import { ConfirmModal, Modal } from "@/components/modals";
import { icons } from "@/icons";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";
import { todayLocalDate } from "@/utils/dateUtils";

defineOptions({ name: "MealEntries" });
defineProps({ entries: { type: Array, required: true } });
const nutritionStore = useNutritionStore();
const toastStore = useToastStore();
const editingEntry = ref(null);
const pendingDeleteId = ref(null);
const isDeleting = ref(false);
const form = reactive({ serving_grams: 100, description: "", log_date: "" });

const startEditing = (entry) => {
  editingEntry.value = entry;
  Object.assign(form, {
    serving_grams: Number(entry.serving_grams),
    description: entry.description ?? "",
    log_date: String(entry.log_date).slice(0, 10),
  });
};

const saveEntry = async () => {
  const entry = editingEntry.value;
  if (!entry) return;
  try {
    let updatedEntry = entry;
    const grams = Number(form.serving_grams);
    if (grams !== Number(entry.serving_grams)) {
      if (entry.data_source === "calorieapi") {
        updatedEntry = await nutritionStore.recalculateEntry(entry, grams);
      } else {
        const factor = grams / Number(entry.serving_grams);
        updatedEntry = await nutritionStore.updateEntry(entry.id, {
          serving_grams: grams,
          calories: Number(entry.calories) * factor,
          protein: Number(entry.protein) * factor,
          carbs: Number(entry.carbs) * factor,
          fat: Number(entry.fat) * factor,
        });
      }
    }
    await nutritionStore.updateEntry(entry.id, {
      description: form.description.trim() || null,
      log_date: form.log_date,
    });
    editingEntry.value = null;
    toastStore.notify("Registro nutricional actualizado");
    return updatedEntry;
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const removeEntry = async () => {
  if (!pendingDeleteId.value) return;
  isDeleting.value = true;
  try {
    await nutritionStore.deleteEntry(pendingDeleteId.value);
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
  <section v-if="entries.length" class="mt-5 border-t border-[#b98a81]/20 pt-5">
    <h3 class="text-sm font-extrabold">Alimentos registrados</h3>
    <div class="mt-3 grid gap-2">
      <article
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-center gap-3 rounded-xl border border-[#b98a81]/20 bg-[#fffdfc] p-3 max-[600px]:items-start"
      >
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600">
          <component :is="icons.navigation.nutrition" class="size-4" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <strong class="block truncate text-sm">{{ entry.food_name }}</strong>
          <p class="mt-0.5 text-xs text-[#573e33]/55">
            {{ entry.serving_grams }} g · {{ entry.calories }} kcal · P {{ entry.protein }} g · C
            {{ entry.carbs }} g · G {{ entry.fat }} g
          </p>
        </div>
        <div class="flex shrink-0 gap-1">
          <button type="button" class="grid size-9 place-items-center rounded-lg border border-[#b98a81]/25 hover:bg-[#f7f1ec]" aria-label="Editar alimento" @click="startEditing(entry)">
            <component :is="icons.actions.edit" class="size-4" />
          </button>
          <button type="button" class="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label="Eliminar alimento" @click="pendingDeleteId = entry.id">
            <component :is="icons.actions.delete" class="size-4" />
          </button>
        </div>
      </article>
    </div>
  </section>

  <Modal :open="Boolean(editingEntry)" title="Editar alimento registrado" :loading="nutritionStore.isLoading" @update:open="editingEntry = null">
    <form class="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1" @submit.prevent="saveEntry">
      <FormField id="edit-nutrition-grams" v-model="form.serving_grams" label="Cantidad consumida (g)" type="number" min="1" step="1" required />
      <DatePicker id="edit-nutrition-date" v-model="form.log_date" label="Fecha" :max="todayLocalDate()" required />
      <label class="col-span-2 grid gap-2 text-sm font-semibold max-[600px]:col-span-1">Nota opcional<input v-model="form.description" maxlength="2000" class="h-11 rounded-lg border border-[#b98a81]/35 px-3 outline-none focus:border-[#573e33]" /></label>
      <div class="col-span-2 flex justify-end gap-3 max-[600px]:col-span-1">
        <button type="button" class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold" @click="editingEntry = null">Cancelar</button>
        <button type="submit" class="h-11 rounded-lg bg-[#573e33] px-5 font-bold text-white">Guardar cambios</button>
      </div>
    </form>
  </Modal>

  <ConfirmModal :open="Boolean(pendingDeleteId)" title="Eliminar alimento" message="El alimento se eliminará del registro y se actualizará el balance diario." confirm-label="Eliminar" :loading="isDeleting" destructive @update:open="pendingDeleteId = null" @confirm="removeEntry" />
</template>
