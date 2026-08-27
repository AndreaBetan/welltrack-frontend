<script setup>
import { CircleCheck, TriangleAlert, X } from "@lucide/vue";
import { useToastStore } from "@/stores/toastStore";

const toastStore = useToastStore();
</script>

<template>
  <div
    class="pointer-events-none fixed right-5 top-5 z-[100] grid w-[min(390px,calc(100vw-40px))] gap-3"
    aria-live="polite"
    aria-atomic="true"
  >
    <button
      v-for="message in toastStore.messages"
      :key="message.id"
      type="button"
      class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-4 text-left shadow-[0_18px_50px_rgba(30,20,16,0.25)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4"
      :class="
        message.type === 'error'
          ? 'border-red-200 bg-red-50 text-red-900 focus:ring-red-200'
          : 'border-emerald-200 bg-emerald-50 text-emerald-900 focus:ring-emerald-200'
      "
      @click="toastStore.dismiss(message.id)"
    >
      <span
        class="grid size-9 shrink-0 place-items-center rounded-full"
        :class="message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'"
        aria-hidden="true"
      >
        <TriangleAlert v-if="message.type === 'error'" class="size-5" />
        <CircleCheck v-else class="size-5" />
      </span>

      <span class="min-w-0 flex-1 pt-0.5 text-sm leading-5">
        <span v-if="message.type === 'error'" class="block font-extrabold">
          Algo ha ido mal
        </span>
        <span
          class="block font-semibold"
          :class="message.type === 'error' ? 'mt-1 opacity-80' : 'pt-1'"
        >
          {{ message.text }}
        </span>
      </span>

      <X class="mt-1 size-4 shrink-0 opacity-60" aria-hidden="true" />
    </button>
  </div>
</template>
