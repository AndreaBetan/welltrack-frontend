<script setup>
import { DatePicker, FormField, Select } from "@/components/forms";
import { useFormFields } from "@/composables/useFormFields";
import { computed } from "vue";
import { icons } from "@/icons";

defineOptions({ name: "ActivityForm" });

const props = defineProps({
  activityTypes: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  typesLoading: { type: Boolean, default: false },
  maxDate: { type: String, required: true },
  idPrefix: { type: String, default: "activity" },
  submitLabel: { type: String, default: "Guardar actividad" },
  cancelLabel: { type: String, default: "" },
});

const emit = defineEmits(["submit", "cancel"]);
const model = defineModel({ type: Object, required: true });

const {
  activity_type: activityType,
  duration_minutes: durationMinutes,
  calories_burned: caloriesBurned,
  log_date: logDate,
  intensity,
  notes,
} = useFormFields(model, ["activity_type", "duration_minutes", "calories_burned", "log_date", "intensity", "notes"]);
const intensityOptions = [
  { value: "low", label: "Baja" },
  { value: "moderate", label: "Moderada" },
  { value: "high", label: "Alta" },
];

const requiresIntensity = computed(() => {
  const selectedActivity = props.activityTypes.find(
    (activity) => activity.value === activityType.value,
  );
  return Boolean(selectedActivity && !selectedActivity.intensity);
});

</script>

<template>
  <form
    class="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1"
    @submit.prevent="emit('submit')"
  >
    <Select
      :id="`${idPrefix}-type`"
      v-model="activityType"
      label="Tipo de actividad"
      :options="activityTypes"
      :placeholder="typesLoading ? 'Cargando actividades...' : 'Selecciona una actividad'"
      :disabled="typesLoading"
      required
    />
    <FormField
      :id="`${idPrefix}-duration`"
      v-model="durationMinutes"
      label="Duración (minutos)"
      type="number"
      min="1"
    />
    <DatePicker
      :id="`${idPrefix}-date`"
      v-model="logDate"
      label="Fecha"
      :max="maxDate"
      required
    />
    <Select
      v-if="requiresIntensity"
      :id="`${idPrefix}-intensity`"
      v-model="intensity"
      label="Intensidad"
      :options="intensityOptions"
      placeholder="Selecciona una intensidad"
      required
    />
    <FormField
      :id="`${idPrefix}-calories`"
      v-model="caloriesBurned"
      label="Calorías quemadas"
      type="number"
      min="0"
    />

    <label
      class="grid min-w-0 gap-2 text-sm font-semibold text-[#573e33]/75 max-[640px]:col-span-1"
      :class="requiresIntensity ? 'col-span-3 max-[1100px]:col-span-1' : 'col-span-4 max-[1100px]:col-span-2'"
      :for="`${idPrefix}-notes`"
    >
      Observaciones
      <input
        :id="`${idPrefix}-notes`"
        v-model="notes"
        maxlength="300"
        class="h-11 w-full min-w-0 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
        placeholder="Ej. Carrera por el parque"
      />
    </label>

    <div
      class="col-span-4 flex justify-end gap-3 max-[1100px]:col-span-2 max-[640px]:col-span-1 max-[420px]:flex-col-reverse"
    >
      <button
        v-if="cancelLabel"
        type="button"
        :disabled="loading"
        class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold transition hover:bg-[#f7f1ec] disabled:opacity-50"
        @click="emit('cancel')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="submit"
        :disabled="loading || typesLoading"
        class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <component :is="icons.actions.add" aria-hidden="true" class="size-4" />
        {{ loading ? "Guardando..." : submitLabel }}
      </button>
    </div>
  </form>
</template>
