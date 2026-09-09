<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Check, ChevronDown } from "@lucide/vue";

defineOptions({ name: "FormSelect" });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  options: { type: Array, required: true },
  placeholder: { type: String, default: "Selecciona una opción" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const model = defineModel({ type: [String, Number], default: "" });
const root = ref(null);
const isOpen = ref(false);

const selectedOption = computed(() => props.options.find((option) => option.value === model.value));

const toggle = () => {
  if (!props.disabled) isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  model.value = option.value;
  isOpen.value = false;
};

const handleOutsideClick = (event) => {
  if (!root.value?.contains(event.target)) isOpen.value = false;
};

const handleEscape = (event) => {
  if (event.key === "Escape") isOpen.value = false;
};

onMounted(() => {
  document.addEventListener("pointerdown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleOutsideClick);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <div ref="root" class="relative grid min-w-0 gap-2 text-sm font-semibold text-[#573e33]/75">
    <label v-if="label" :for="id">{{ label }}</label>

    <button
      :id="id"
      type="button"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      class="flex h-11 w-full min-w-0 items-center gap-3 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-left text-[#573e33] outline-none transition hover:border-[#b98a81]/60 focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15 disabled:cursor-not-allowed disabled:opacity-50"
      @click="toggle"
    >
      <component
        :is="selectedOption.icon"
        v-if="selectedOption?.icon"
        aria-hidden="true"
        class="size-4 shrink-0 text-[#a46f62]"
      />
      <span class="min-w-0 flex-1 truncate" :class="selectedOption ? '' : 'text-[#573e33]/45'">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <ChevronDown
        aria-hidden="true"
        class="size-4 shrink-0 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Mantiene la validación required del formulario. -->
    <input
      v-if="required"
      v-model="model"
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-1/2 size-px opacity-0"
      tabindex="-1"
      :disabled="disabled"
      required
    />

    <div
      v-if="isOpen"
      class="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#b98a81]/25 bg-white p-1.5 shadow-[0_18px_45px_rgba(87,62,51,0.16)]"
      role="listbox"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="option"
        :aria-selected="option.value === model"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-[#f7f1ec]"
        :class="
          option.value === model ? 'bg-[#f7f1ec] font-bold text-[#573e33]' : 'text-[#573e33]/75'
        "
        @click="selectOption(option)"
      >
        <component
          :is="option.icon"
          v-if="option.icon"
          aria-hidden="true"
          class="size-4 shrink-0 text-[#a46f62]"
        />
        <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
        <Check v-if="option.value === model" aria-hidden="true" class="size-4 shrink-0" />
      </button>
    </div>
  </div>
</template>
