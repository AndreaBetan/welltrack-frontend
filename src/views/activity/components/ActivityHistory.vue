<script setup>
import { computed, ref, watch } from "vue";
import { icons } from "@/icons";
import DataTable from "@/components/data/DataTable.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { Select } from "@/components/forms";
import { parseLocalDate } from "@/utils/dateUtils";

defineOptions({ name: "ActivityHistory" });

const props = defineProps({
  entries: { type: Array, required: true },
  activitiesByCode: { type: Map, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete"]);
const activityFilter = ref("all");
const periodFilter = ref("7");

const intensityLabels = {
  low: "Baja",
  moderate: "Moderada",
  high: "Alta",
};
const periodOptions = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "all", label: "Todo el historial" },
];
const columns = [
  { key: "log_date", label: "Fecha", cellClass: "font-semibold" },
  { key: "activity_type", label: "Actividad" },
  { key: "intensity", label: "Intensidad" },
  { key: "duration_minutes", label: "Duración" },
  { key: "calories_burned", label: "Calorías", cellClass: "font-semibold" },
  { key: "notes", label: "Observaciones", cellClass: "max-w-64" },
];

const activityFilterOptions = computed(() => {
  const registeredTypes = new Set(props.entries.map((entry) => entry.activity_type));
  const options = [...registeredTypes]
    .map((code) => props.activitiesByCode.get(code))
    .filter(Boolean)
    .sort((first, second) => first.label.localeCompare(second.label, "es"));

  return [{ value: "all", label: "Todas las actividades" }, ...options];
});

const filteredEntries = computed(() => {
  let minimumDate = null;
  if (periodFilter.value !== "all") {
    minimumDate = new Date();
    minimumDate.setHours(0, 0, 0, 0);
    minimumDate.setDate(minimumDate.getDate() - Number(periodFilter.value) + 1);
  }

  return props.entries.filter((entry) => {
    const matchesActivity =
      activityFilter.value === "all" || entry.activity_type === activityFilter.value;
    const matchesPeriod = !minimumDate || parseLocalDate(entry.log_date) >= minimumDate;
    return matchesActivity && matchesPeriod;
  });
});

const formatLogDate = (value) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
    .format(parseLocalDate(value))
    .replace(" de ", " ");

const intensityClass = (value) =>
  ({
    low: "bg-emerald-50 text-emerald-700",
    moderate: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  })[value] ?? "bg-[#f7f1ec] text-[#573e33]";

watch(activityFilterOptions, (options) => {
  if (!options.some((option) => option.value === activityFilter.value)) {
    activityFilter.value = "all";
  }
});
</script>

<template>
  <section class="grid gap-3">
    <div
      class="flex items-center justify-between gap-4 max-[760px]:items-start max-[760px]:flex-col"
    >
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-full bg-[#fbf4e9] text-[#9d7958]">
          <component :is="icons.common.clock" aria-hidden="true" class="size-5" />
        </span>
        <h2 class="text-xl font-extrabold">Historial de actividades</h2>
      </div>
      <div
        class="grid min-w-/[430px/] grid-cols-2 gap-2 max-[520px]:w-full max-[520px]:min-w-0 max-[520px]:grid-cols-1"
      >
        <Select
          id="activity-filter"
          v-model="activityFilter"
          :options="activityFilterOptions"
          placeholder="Todas las actividades"
        />
        <Select
          id="period-filter"
          v-model="periodFilter"
          :options="periodOptions"
          placeholder="Últimos 7 días"
        />
      </div>
    </div>

    <LoadingState v-if="loading" />
    <DataTable
      v-else-if="filteredEntries.length"
      :columns="columns"
      :rows="filteredEntries"
      :max-rows="5"
      min-width="930px"
    >
      <template #cell-log_date="{ value }">{{ formatLogDate(value) }}</template>
      <template #cell-activity_type="{ row }">
        <div class="flex items-center gap-3">
          <span class="grid size-9 place-items-center rounded-full bg-[#f8f2ed] text-[#8f6558]">
            <component
              :is="activitiesByCode.get(row.activity_type)?.icon ?? icons.common.person"
              aria-hidden="true"
              class="size-4"
            />
          </span>
          <strong>{{ activitiesByCode.get(row.activity_type)?.label ?? row.activity_type }}</strong>
        </div>
      </template>
      <template #cell-intensity="{ value }">
        <span
          class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold"
          :class="intensityClass(value)"
        >
          <span class="size-1.5 rounded-full bg-current" />
          {{ intensityLabels[value] ?? value ?? "—" }}
        </span>
      </template>
      <template #cell-duration_minutes="{ value }">{{ value }} min</template>
      <template #cell-calories_burned="{ value }">{{ value }} kcal</template>
      <template #cell-notes="{ value }">
        <span class="block truncate text-[#573e33]/65">{{ value || "—" }}</span>
      </template>
      <template #actions="{ row }">
        <div class="flex justify-center gap-2">
          <button
            type="button"
            title="Editar actividad"
            aria-label="Editar actividad"
            class="grid size-9 place-items-center rounded-lg border border-[#b98a81]/30 transition hover:bg-[#f7f1ec]"
            @click="emit('edit', row)"
          >
            <component :is="icons.actions.edit" aria-hidden="true" class="size-4" />
          </button>
          <button
            type="button"
            title="Eliminar actividad"
            aria-label="Eliminar actividad"
            class="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
            @click="emit('delete', row.id)"
          >
            <component :is="icons.actions.delete" aria-hidden="true" class="size-4" />
          </button>
        </div>
      </template>
    </DataTable>
    <EmptyState
      v-else
      title="No hay actividades para mostrar"
      description="Registra una actividad o cambia los filtros seleccionados."
    />
  </section>
</template>
