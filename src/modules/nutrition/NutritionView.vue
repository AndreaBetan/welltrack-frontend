<script setup>
import { reactive } from "vue";
import BaseCard from "@/components/BaseCard.vue";
import DataTable from "@/components/DataTable.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormField from "@/components/FormField.vue";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useToastStore } from "@/stores/toastStore";

const nutritionStore = useNutritionStore();
const toastStore = useToastStore();

const today = new Date().toISOString().slice(0, 10);
const form = reactive({ date: today, calories: "", protein: "", fat: "", carbs: "" });

const columns = [
  { key: "date", label: "Fecha" },
  { key: "calories", label: "Calorias", format: (value) => `${value} kcal` },
  { key: "protein", label: "Proteinas", format: (value) => `${value} g` },
  { key: "fat", label: "Grasas", format: (value) => `${value} g` },
  { key: "carbs", label: "Carbohidratos", format: (value) => `${value} g` },
];

const handleSubmit = () => {
  nutritionStore.addEntry(form);
  Object.assign(form, { date: today, calories: "", protein: "", fat: "", carbs: "" });
  toastStore.notify("Registro nutricional guardado");
};
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Nutrición"
      title="Alimentación"
      description="Registra tus macronutrientes diarios y revisa tu historial nutricional."
    />

    <BaseCard>
      <form class="grid grid-cols-5 gap-4 max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1" @submit.prevent="handleSubmit">
        <FormField id="nutrition-date" v-model="form.date" label="Fecha" type="date" />
        <FormField id="nutrition-calories" v-model="form.calories" label="Calorias" type="number" min="0" />
        <FormField id="nutrition-protein" v-model="form.protein" label="Proteinas" type="number" min="0" step="0.1" />
        <FormField id="nutrition-fat" v-model="form.fat" label="Grasas" type="number" min="0" step="0.1" />
        <FormField id="nutrition-carbs" v-model="form.carbs" label="Carbohidratos" type="number" min="0" step="0.1" />
        <button class="h-11 self-end rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] max-[1120px]:col-span-2 max-[680px]:col-span-1">
          Guardar
        </button>
      </form>
    </BaseCard>

    <section class="grid gap-4">
      <h2 class="text-2xl font-bold">Historial</h2>
      <LoadingState v-if="nutritionStore.isLoading" />
      <DataTable v-else-if="nutritionStore.entries.length" :columns="columns" :rows="nutritionStore.entries" />
      <EmptyState
        v-else
        title="Todavia no hay registros"
        description="Añade tu primera comida para activar el seguimiento nutricional."
      />
    </section>
  </section>
</template>
