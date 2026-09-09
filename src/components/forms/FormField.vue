<script setup>
import { icons } from "@/icons";

defineOptions({ inheritAttrs: false });

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: "text" },
  min: { type: [String, Number], default: null },
  max: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null },
  autocomplete: { type: String, default: "" },
  required: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  maxlength: { type: [String, Number], default: null },
  help: { type: String, default: "" },
});

const model = defineModel({ type: [String, Number], default: "" });
</script>

<template>
  <div class="grid min-w-0 gap-2 text-sm font-semibold text-[#573e33]/75" :class="$attrs.class" :style="$attrs.style">
    <div class="flex items-center gap-1.5">
      <label :for="id">{{ label }}</label>
      <span v-if="help" class="group relative inline-flex">
        <button
          type="button"
          :aria-label="`Ayuda sobre ${label}`"
          :aria-describedby="`${id}-help`"
          class="grid size-5 place-items-center rounded-full text-[#a46f62] outline-none transition hover:bg-[#f7eee8] focus:bg-[#f7eee8] focus:ring-2 focus:ring-[#b98a81]/30"
        >
          <component :is="icons.common.help" aria-hidden="true" class="size-3.5" />
        </button>
        <span
          :id="`${id}-help`"
          role="tooltip"
          class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-[#573e33] px-3 py-2 text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 max-[480px]:left-0 max-[480px]:translate-x-0"
        >
          {{ help }}
        </span>
      </span>
    </div>
    <input
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :id="id"
      v-model="model"
      :type="type"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :maxlength="maxlength"
      class="block h-11 w-full min-w-0 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-[#573e33] outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15 disabled:cursor-not-allowed disabled:opacity-60"
      :class="type === 'time' ? 'appearance-none' : ''"
    />
  </div>
</template>

<style scoped>
/* Safari iOS aplica un ancho intrínseco a los campos de hora que puede
   desbordar incluso un contenedor con width: 100%. */
input[type="time"] {
  min-inline-size: 0;
  max-inline-size: 100%;
  -webkit-appearance: none;
}
</style>
