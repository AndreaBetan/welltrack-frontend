<script setup>
import { computed, ref } from "vue";
import DataTable from "@/components/data/DataTable.vue";
import { Select } from "@/components/forms";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { icons } from "@/icons";
import { parseLocalDate } from "@/utils/dateUtils";
import { formatMinutes } from "@/utils/durationUtils";

const props = defineProps({
  entries: { type: Array, required: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["edit", "delete"]);
const sleepTypeFilter = ref("all");
const periodFilter = ref("7");

const sleepTypeOptions = [
  { value: "all", label: "Todos los descansos" },
  { value: "night", label: "Sueño nocturno" },
  { value: "nap", label: "Siestas" },
];
const periodOptions = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "all", label: "Todo el historial" },
];

const columns = [
  { key: "log_date", label: "Fecha", cellClass: "font-semibold" },
  { key: "sleep_type", label: "Tipo" },
  { key: "schedule", label: "Horario" },
  { key: "duration_minutes", label: "Duración" },
  { key: "sleep_quality", label: "Calidad" },
  { key: "awakenings_count", label: "Despertares" },
];
const qualityLabels = ["", "Muy mala", "Mala", "Regular", "Buena", "Muy buena"];
const filteredEntries = computed(() => {
  let minimumDate = null;
  if (periodFilter.value !== "all") {
    minimumDate = new Date();
    minimumDate.setHours(0, 0, 0, 0);
    minimumDate.setDate(minimumDate.getDate() - Number(periodFilter.value) + 1);
  }

  return props.entries.filter((entry) => {
    const matchesType =
      sleepTypeFilter.value === "all" || entry.sleep_type === sleepTypeFilter.value;
    const matchesPeriod = !minimumDate || parseLocalDate(entry.log_date) >= minimumDate;
    return matchesType && matchesPeriod;
  });
});
const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(
        new Date(value),
      )
    : "—";
const formatDate = (value) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
    .format(parseLocalDate(value))
    .replace(" de ", " ");
</script>

<template>
  <section class="grid gap-4">
    <div
      class="flex items-center justify-between gap-4 max-[760px]:items-start max-[760px]:flex-col"
    >
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-full bg-purple-50 text-purple-700">
          <component :is="icons.common.clock" aria-hidden="true" class="size-5" />
        </span>
        <h2 class="text-xl font-extrabold">Historial de sueño</h2>
      </div>
      <div
        class="grid min-w-[430px] grid-cols-2 gap-2 max-[520px]:w-full max-[520px]:min-w-0 max-[520px]:grid-cols-1"
      >
        <Select
          id="sleep-type-filter"
          v-model="sleepTypeFilter"
          :options="sleepTypeOptions"
          placeholder="Todos los descansos"
        />
        <Select
          id="sleep-period-filter"
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
      min-width="850px"
    >
      <template #cell-log_date="{ value }">{{ formatDate(value) }}</template>
      <template #cell-sleep_type="{ value }">{{
        value === "nap" ? "Siesta" : "Nocturno"
      }}</template>
      <template #cell-schedule="{ row }"
        >{{ formatTime(row.started_at) }} – {{ formatTime(row.ended_at) }}</template
      >
      <template #cell-duration_minutes="{ value }">{{ formatMinutes(value) }}</template>
      <template #cell-sleep_quality="{ value }"
        >{{ qualityLabels[Number(value)] ?? "—" }} ({{ value }}/5)</template
      >
      <template #actions="{ row }">
        <div class="flex justify-center gap-2">
          <button
            type="button"
            aria-label="Editar registro"
            class="grid size-9 place-items-center rounded-lg border border-[#b98a81]/30 hover:bg-[#f7f1ec]"
            @click="emit('edit', row)"
          >
            <component :is="icons.actions.edit" aria-hidden="true" class="size-4" />
          </button>
          <button
            type="button"
            aria-label="Eliminar registro"
            class="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            @click="emit('delete', row.id)"
          >
            <component :is="icons.actions.delete" aria-hidden="true" class="size-4" />
          </button>
        </div>
      </template>
    </DataTable>
    <EmptyState
      v-else
      title="No hay descansos para mostrar"
      description="Registra un descanso o cambia los filtros seleccionados."
    />
  </section>
</template>
