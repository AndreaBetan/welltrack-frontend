<script setup>
import { computed } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import FormField from "@/components/forms/FormField.vue";
import { DatePicker, Select } from "@/components/forms";
import { icons } from "@/icons";

defineOptions({ name: "SleepForm" });

defineProps({
  factors: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  factorsLoading: { type: Boolean, default: false },
  maxDate: { type: String, required: true },
  idPrefix: { type: String, default: "sleep" },
  title: { type: String, default: "" },
  submitLabel: { type: String, default: "Guardar descanso" },
  cancelLabel: { type: String, default: "" },
  card: { type: Boolean, default: true },
});

const emit = defineEmits(["submit", "cancel"]);
const model = defineModel({ type: Object, required: true });

const fieldModel = (key) =>
  computed({
    get: () => model.value[key],
    set: (value) => {
      model.value = { ...model.value, [key]: value };
    },
  });

const fields = Object.fromEntries(
  ["log_date", "start_time", "end_time", "sleep_quality", "sleep_latency_minutes", "awakenings_count", "sleep_type"].map(
    (key) => [key, fieldModel(key)],
  ),
);

const sleepTypeOptions = [
  { value: "night", label: "Sueño nocturno" },
  { value: "nap", label: "Siesta" },
];
const qualityOptions = [
  { value: 1, label: "Muy mala" },
  { value: 2, label: "Mala" },
  { value: 3, label: "Regular" },
  { value: 4, label: "Buena" },
  { value: 5, label: "Muy buena" },
];

const toggleFactor = (code) => {
  const factors = [...model.value.factors];
  const index = factors.indexOf(code);
  if (index === -1) factors.push(code);
  else factors.splice(index, 1);
  model.value = { ...model.value, factors };
};
</script>

<template>
  <component :is="card ? BaseCard : 'div'">
    <h2 v-if="title" class="mb-6 text-xl font-extrabold">{{ title }}</h2>
    <form class="grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[640px]:grid-cols-1" @submit.prevent="emit('submit')">
      <DatePicker :id="`${idPrefix}-date`" v-model="fields.log_date.value" label="Fecha de despertar" :max="maxDate" required />
      <FormField :id="`${idPrefix}-start`" v-model="fields.start_time.value" label="Hora de inicio" type="time" />
      <FormField :id="`${idPrefix}-end`" v-model="fields.end_time.value" label="Hora de fin" type="time" />
      <Select :id="`${idPrefix}-type`" v-model="fields.sleep_type.value" label="Tipo de descanso" :options="sleepTypeOptions" required />
      <Select :id="`${idPrefix}-quality`" v-model="fields.sleep_quality.value" label="Calidad percibida" :options="qualityOptions" required />
      <FormField :id="`${idPrefix}-latency`" v-model="fields.sleep_latency_minutes.value" label="Tiempo para dormir (min)" help="Indica aproximadamente cuántos minutos tardaste en quedarte dormido." type="number" min="0" max="1440" />
      <FormField :id="`${idPrefix}-awakenings`" v-model="fields.awakenings_count.value" label="Número de despertares" type="number" min="0" />

      <fieldset class="col-span-4 grid gap-2 max-[1050px]:col-span-2 max-[640px]:col-span-1">
        <legend class="text-sm font-semibold text-[#573e33]/75">Factores que afectaron al sueño</legend>
        <p v-if="factorsLoading" class="text-sm text-[#573e33]/50">Cargando factores...</p>
        <div v-else class="flex flex-wrap gap-2">
          <button v-for="factor in factors" :key="factor.id" type="button" class="rounded-full border px-4 py-2 text-sm font-semibold transition" :class="model.factors.includes(factor.code) ? 'border-[#573e33] bg-[#573e33] text-white' : 'border-[#b98a81]/35 hover:bg-[#f7f1ec]'" @click="toggleFactor(factor.code)">{{ factor.name }}</button>
        </div>
      </fieldset>

      <div class="col-span-4 flex gap-3 max-[1050px]:col-span-2 max-[640px]:col-span-1 max-[420px]:flex-col-reverse">
        <button v-if="cancelLabel" type="button" :disabled="loading" class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold" @click="emit('cancel')">{{ cancelLabel }}</button>
        <button type="submit" :disabled="loading || factorsLoading" class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:opacity-50">
          <component :is="icons.actions.add" aria-hidden="true" class="size-4" />
          {{ loading ? "Guardando..." : submitLabel }}
        </button>
      </div>
    </form>
  </component>
</template>
