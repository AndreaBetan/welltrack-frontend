<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: "text" },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null },
  autocomplete: { type: String, default: "" },
  required: { type: Boolean, default: true },
});

const model = defineModel({ type: [String, Number], default: "" });
</script>

<template>
  <label class="grid min-w-0 gap-2 text-sm font-semibold text-[#573e33]/75" :for="id">
    {{ label }}
    <input
      :id="id"
      v-model="model"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autocomplete"
      :required="required"
      class="h-11 w-full min-w-0 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-[#573e33] outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
    />
  </label>
</template>
