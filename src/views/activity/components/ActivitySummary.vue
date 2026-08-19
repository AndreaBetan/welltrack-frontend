<script setup>
defineOptions({ name: "ActivitySummary" });

defineProps({
  summary: { type: Object, required: true },
});
</script>

<template>
  <section
    class="grid grid-cols-4 gap-4 rounded-2xl border border-[#b98a81]/20 bg-white p-5 shadow-[0_12px_35px_rgba(87,62,51,0.05)] max-[1050px]:grid-cols-2 max-[560px]:grid-cols-1"
  >
    <article class="rounded-xl bg-emerald-50/70 p-5">
      <p class="text-sm font-semibold text-emerald-800/70">Actividades esta semana</p>
      <strong class="mt-2 block text-xl">{{ summary.sessions }}</strong>
      <span class="mt-2 block text-xs text-emerald-700">Sesiones registradas</span>
    </article>
    <article class="rounded-xl bg-amber-50/80 p-5">
      <p class="text-sm font-semibold text-amber-800/70">Calorías quemadas</p>
      <strong class="mt-2 block text-xl">
        {{ summary.calories }} <small class="text-base">kcal</small>
      </strong>
      <span class="mt-2 block text-xs text-amber-700">Acumulado semanal</span>
    </article>
    <article class="rounded-xl bg-purple-50/80 p-5">
      <p class="text-sm font-semibold text-purple-800/70">Tiempo total</p>
      <strong class="mt-2 block text-xl">{{ summary.formattedTime }}</strong>
      <span class="mt-2 block text-xs text-purple-700">Actividad esta semana</span>
    </article>
    <article class="rounded-xl bg-blue-50/80 p-5">
      <p class="text-sm font-semibold text-blue-800/70">Promedio por actividad</p>
      <strong class="mt-2 block text-xl">
        {{ summary.averageCalories }} <small class="text-base">kcal</small>
      </strong>
      <span class="mt-2 block text-xs text-blue-700">Media semanal</span>
    </article>
  </section>
</template>
