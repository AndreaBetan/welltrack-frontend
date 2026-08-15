<script setup>
import { useToastStore } from "@/stores/toastStore";

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed right-5 top-5 z-50 grid w-[min(360px,calc(100vw-40px))] gap-3">
    <button
      v-for="message in toastStore.messages"
      :key="message.id"
      type="button"
      class="rounded-lg border px-4 py-3 text-left text-sm font-semibold shadow-[0_18px_50px_rgba(87,62,51,0.16)]"
      :class="
        message.type === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-[#b98a81]/30 bg-white text-[#573e33]'
      "
      @click="toastStore.dismiss(message.id)"
    >
      {{ message.text }}
    </button>
  </div>
</template>
