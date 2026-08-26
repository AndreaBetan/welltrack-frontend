<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  calories: { type: [Number, String], default: 0 },
  compact: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const fields = [
  { key: "carbs_percentage", label: "Carbohidratos", shortLabel: "Carb. %", kcalPerGram: 4 },
  { key: "protein_percentage", label: "Proteína", shortLabel: "Prot. %", kcalPerGram: 4 },
  { key: "fat_percentage", label: "Grasas", shortLabel: "Grasa %", kcalPerGram: 9 },
];

const total = computed(() =>
  fields.reduce((sum, field) => sum + Number(props.modelValue[field.key] || 0), 0),
);
const isValid = computed(() => Math.abs(total.value - 100) < 0.001);

const updateField = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: Number(value) });
};

const gramsFor = (field) => {
  const calories = Number(props.calories || 0);
  const percentage = Number(props.modelValue[field.key] || 0);
  return Math.round(((calories * percentage) / 100 / field.kcalPerGram) * 10) / 10;
};
</script>

<template>
  <div
    class="grid gap-3"
    :class="compact ? '' : 'rounded-xl border border-[#b98a81]/25 bg-white p-4'"
  >
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 :class="compact ? 'text-[0.68rem] font-extrabold' : 'text-sm font-extrabold'">
          {{ compact ? "Distribución" : "Distribución de macronutrientes" }}
        </h3>
        <p v-if="!compact" class="mt-0.5 text-xs text-[#573e33]/55">
          Los tres porcentajes deben sumar 100%.
        </p>
      </div>
      <strong
        class="rounded-full px-2 py-1 text-[0.65rem]"
        :class="isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
      >
        {{ total }}%
      </strong>
    </div>

    <div
      class="grid gap-3"
      :class="compact ? 'grid-cols-3 gap-1.5!' : 'grid-cols-3 max-[640px]:grid-cols-1'"
    >
      <label
        v-for="field in fields"
        :key="field.key"
        class="grid min-w-0 gap-1 text-xs font-bold"
      >
        {{ compact ? field.shortLabel : field.label }}
        <div
          class="grid items-center rounded-lg border border-[#b98a81]/30 bg-white focus-within:border-[#573e33]"
          :class="compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto]'"
        >
          <input
            :value="modelValue[field.key]"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            required
            :class="compact ? 'h-8 px-1.5 text-center text-xs' : 'h-10 px-3'"
            class="min-w-0 rounded-lg outline-none"
            @input="updateField(field.key, $event.target.value)"
          />
          <span v-if="!compact" class="pr-3 text-[#573e33]/50">%</span>
        </div>
        <small
          v-if="Number(calories)"
          class="whitespace-nowrap text-center font-normal text-[#573e33]/50"
        >
          {{ compact ? `${gramsFor(field)} g` : `${gramsFor(field)} g diarios` }}
        </small>
      </label>
    </div>
  </div>
</template>
