<script setup>
import { reactive } from "vue";
import BaseCard from "@/components/BaseCard.vue";
import DataTable from "@/components/DataTable.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormField from "@/components/FormField.vue";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import { useActivityStore } from "@/stores/activityStore";
import { useToastStore } from "@/stores/toastStore";

const activityStore = useActivityStore();
const toastStore = useToastStore();
const form = reactive({ type: "", duration: "", caloriesBurned: "" });

const columns = [
  { key: "date", label: "Fecha" },
  { key: "type", label: "Actividad" },
  { key: "duration", label: "Duracion", format: (value) => `${value} min` },
  { key: "caloriesBurned", label: "Calorias quemadas", format: (value) => `${value} kcal` },
];

const handleSubmit = () => {
  activityStore.addEntry(form);
  Object.assign(form, { type: "", duration: "", caloriesBurned: "" });
  toastStore.notify("Actividad registrada");
};
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Movimiento"
      title="Actividad física"
      description="Registra entrenamientos, duracion y energia gastada durante el dia."
    />

    <BaseCard>
      <form class="grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1" @submit.prevent="handleSubmit">
        <FormField id="activity-type" v-model="form.type" label="Tipo de actividad" autocomplete="off" />
        <FormField id="activity-duration" v-model="form.duration" label="Duracion" type="number" min="1" />
        <FormField id="activity-calories" v-model="form.caloriesBurned" label="Calorias quemadas" type="number" min="0" />
        <button class="h-11 self-end rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40]">
          Guardar
        </button>
      </form>
    </BaseCard>

    <section class="grid gap-4">
      <h2 class="text-2xl font-bold">Historial</h2>
      <LoadingState v-if="activityStore.isLoading" />
      <DataTable v-else-if="activityStore.entries.length" :columns="columns" :rows="activityStore.entries" />
      <EmptyState
        v-else
        title="No hay actividad registrada"
        description="Registra una caminata, entrenamiento o sesion suave para completar tu resumen diario."
      />
    </section>
  </section>
</template>
