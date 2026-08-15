<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
});
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-[#b98a81]/25 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[620px] border-collapse text-left">
        <thead class="bg-[#f7f1ec] text-xs uppercase tracking-[0.08em] text-[#573e33]/60">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-3 font-extrabold">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#b98a81]/20">
          <tr v-for="row in rows" :key="row.id" class="text-sm text-[#573e33]/78">
            <td v-for="column in columns" :key="column.key" class="px-4 py-4">
              {{ column.format ? column.format(row[column.key], row) : row[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
