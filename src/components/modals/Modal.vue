<script setup>
import { onBeforeUnmount, watch } from "vue";
import { icons } from "@/icons";

defineOptions({ name: "AppModal" });

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  loading: { type: Boolean, default: false },
  maxWidth: { type: String, default: "48rem" },
});

const emit = defineEmits(["update:open"]);
let previousOverflow = "";

const close = () => {
  if (!props.loading) emit("update:open", false);
};

const handleKeydown = (event) => {
  if (event.key === "Escape") close();
};

watch(
  () => props.open,
  (open) => {
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeydown);
      return;
    }

    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", handleKeydown);
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] grid place-items-center bg-[#2f201a]/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      @click.self="close"
    >
      <section
        class="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-[#b98a81]/20 bg-white p-6 text-[#573e33] shadow-[0_24px_70px_rgba(47,32,26,0.24)]"
        :style="{ maxWidth }"
      >
        <header class="mb-6 flex items-center justify-between gap-4">
          <h2 id="app-modal-title" class="text-2xl font-extrabold">{{ title }}</h2>
          <button
            type="button"
            title="Cerrar"
            aria-label="Cerrar"
            :disabled="loading"
            class="grid size-9 place-items-center rounded-lg border border-[#b98a81]/35 transition hover:bg-[#f7f1ec] disabled:opacity-50"
            @click="close"
          >
            <component :is="icons.actions.close" aria-hidden="true" class="size-5" />
          </button>
        </header>

        <slot />
      </section>
    </div>
  </Teleport>
</template>
