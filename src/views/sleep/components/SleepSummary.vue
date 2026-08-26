<script setup>
import SummaryCard from "@/components/ui/SummaryCard.vue";
import { icons } from "@/icons";
import { formatMinutes } from "@/utils/durationUtils";

defineProps({
  lastDuration: { type: [Number, String], default: 0 },
  averageDuration: { type: Number, default: 0 },
  averageQuality: { type: Number, default: 0 },
});
</script>

<template>
  <section
    class="grid grid-cols-3 gap-4 rounded-2xl border border-[#b98a81]/20 bg-white p-5 shadow-[0_12px_35px_rgba(87,62,51,0.05)] max-[900px]:grid-cols-1"
  >
    <SummaryCard
      label="Último descanso"
      :value="formatMinutes(lastDuration)"
      helper="Duración registrada"
      :icon="icons.sleep.lastDuration"
      tone="purple"
    />
    <SummaryCard
      label="Promedio"
      :value="formatMinutes(averageDuration)"
      helper="Todos los registros"
      :icon="icons.sleep.averageDuration"
      tone="blue"
    />
    <SummaryCard
      label="Calidad media"
      :value="`${averageQuality || 0} / 5`"
      helper="Valoración percibida"
      :icon="icons.sleep.quality"
      tone="emerald"
    />
  </section>
</template>
