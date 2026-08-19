<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { icons } from "@/icons";

defineOptions({ name: "ConfirmModal" });

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: "Confirmar acción" },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: "Confirmar" },
  cancelLabel: { type: String, default: "Cancelar" },
  loading: { type: Boolean, default: false },
  destructive: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "confirm"]);
const cancelButton = ref(null);
let previousOverflow = "";

const close = () => {
  if (!props.loading) emit("update:open", false);
};

const handleKeydown = (event) => {
  if (event.key === "Escape") close();
};

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeydown);
      await nextTick();
      cancelButton.value?.focus();
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
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-70 grid place-items-center bg-[#2f201a]/55 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        @click.self="close"
      >
        <section
          class="w-full max-w-md rounded-2xl border border-[#b98a81]/20 bg-white p-6 text-[#573e33] shadow-[0_24px_70px_rgba(47,32,26,0.24)]"
        >
          <div class="flex items-start gap-4">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-full"
              :class="destructive ? 'bg-red-50 text-red-600' : 'bg-[#f7eee8] text-[#a46f62]'"
            >
              <component
                :is="destructive ? icons.actions.delete : icons.common.warning"
                aria-hidden="true"
                class="size-5"
              />
            </span>
            <div class="min-w-0 flex-1">
              <h2 id="confirm-modal-title" class="text-xl mt-2 font-extrabold">{{ title }}</h2>
              <p class="mt-4 text-sm leading-6 text-[#573e33]/65">{{ message }}</p>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              :disabled="loading"
              class="grid size-8 shrink-0 place-items-center rounded-lg transition hover:bg-[#f7f1ec] disabled:opacity-40"
              @click="close"
            >
              <component :is="icons.actions.close" aria-hidden="true" class="size-4" />
            </button>
          </div>

          <div class="mt-4 flex justify-end gap-3 max-[420px]:flex-col-reverse">
            <button
              ref="cancelButton"
              type="button"
              :disabled="loading"
              class="h-11 rounded-lg border border-[#b98a81]/35 px-4 font-bold transition hover:bg-[#f7f1ec] disabled:opacity-50"
              @click="close"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              :disabled="loading"
              class="h-11 rounded-lg px-4 font-bold text-white transition disabled:cursor-wait disabled:opacity-60"
              :class="
                destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#573e33] hover:bg-[#6d4d40]'
              "
              @click="emit('confirm')"
            >
              {{ loading ? "Procesando..." : confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
