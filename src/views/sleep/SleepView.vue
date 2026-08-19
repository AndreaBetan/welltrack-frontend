<script setup>
import { reactive } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import DataTable from "@/components/data/DataTable.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import FormField from "@/components/forms/FormField.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useSleepStore } from "@/stores/sleepStore";
import { useToastStore } from "@/stores/toastStore";

const sleepStore = useSleepStore();
const toastStore = useToastStore();
const form = reactive({ startTime: "", endTime: "", quality: "" });

const columns = [
  { key: "startTime", label: "Inicio" },
  { key: "endTime", label: "Fin" },
  { key: "durationHours", label: "Duracion", format: (value) => `${value} h` },
  { key: "quality", label: "Calidad", format: (value) => `${value}%` },
];

const handleSubmit = () => {
  sleepStore.addEntry(form);
  Object.assign(form, { startTime: "", endTime: "", quality: "" });
  toastStore.notify("Sueño registrado");
};
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Descanso"
      title="Sueño"
      description="Registra tus horas de descanso y la calidad percibida de cada noche."
    />

    <BaseCard>
      <form class="grid grid-cols-4 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1" @submit.prevent="handleSubmit">
        <FormField id="sleep-start" v-model="form.startTime" label="Hora de inicio" type="time" />
        <FormField id="sleep-end" v-model="form.endTime" label="Hora de fin" type="time" />
        <FormField id="sleep-quality" v-model="form.quality" label="Calidad del sueño" type="number" min="1" max="100" />
        <button class="h-11 self-end rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40]">
          Guardar
        </button>
      </form>
    </BaseCard>

    <section class="grid gap-4">
      <h2 class="text-2xl font-bold">Historial</h2>
      <LoadingState v-if="sleepStore.isLoading" />
      <DataTable
        v-else-if="sleepStore.entries.length"
        :columns="columns"
        :rows="sleepStore.entries"
        :max-rows="5"
      />
      <EmptyState
        v-else
        title="Sin datos de descanso"
        description="Registra tu ultima noche para recibir recomendaciones mas precisas."
      />
    </section>
  </section>
</template>
