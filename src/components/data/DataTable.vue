<script setup>
import { computed } from "vue";

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  maxRows: {
    type: Number,
    required: true,
    validator: (value) => Number.isInteger(value) && value > 0,
  },
  rowKey: { type: String, default: "id" },
  minWidth: { type: String, default: "620px" },
  actionsLabel: { type: String, default: "Acciones" },
});

const getRowKey = (row, index) => row[props.rowKey] ?? index;

// 48 px corresponden a la cabecera y 68 px a cada fila de datos.
const scrollAreaStyle = computed(() => ({
  maxHeight: `${48 + props.maxRows * 68}px`,
}));
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-[#b98a81]/25 bg-white shadow-[0_12px_35px_rgba(87,62,51,0.05)]"
  >
    <div class="table-scroll overflow-auto" :style="scrollAreaStyle">
      <table class="w-full border-collapse text-left" :style="{ minWidth }">
        <thead
          class="sticky top-0 z-10 bg-[#fbf5f1] text-xs uppercase tracking-[0.09em] text-[#573e33]/60"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 font-extrabold"
              :class="column.headerClass"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="px-5 py-4 text-center font-extrabold">
              {{ actionsLabel }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#b98a81]/15">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="getRowKey(row, rowIndex)"
            class="h-[68px] text-sm text-[#573e33]/78 transition hover:bg-[#fdfaf8]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4"
              :class="column.cellClass"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="row[column.key]"
              >
                {{ column.format ? column.format(row[column.key], row) : row[column.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-5 py-4">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-scroll {
  scrollbar-color: rgb(185 138 129 / 45%) transparent;
  scrollbar-width: thin;
}

.table-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.table-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgb(185 138 129 / 45%);
}
</style>
