<script setup>
import logoApp from "@/assets/wellTrack.png";

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<template>
  <section class="min-h-screen bg-white text-[#573e33]">
    <div class="grid min-h-screen grid-cols-2 max-[980px]:grid-cols-1">
      <img :src="logoApp" alt="" class="h-full w-full object-cover max-[980px]:hidden" />

      <div class="flex items-center justify-center px-8 py-12 max-[480px]:px-5">
        <main class="w-full max-w-md">
          <p class="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#b98a81]">
            WellTrack
          </p>
          <h1 class="text-3xl font-extrabold">{{ title }}</h1>
          <p v-if="description" class="mt-3 text-sm leading-6 text-[#573e33]/70">
            {{ description }}
          </p>

          <slot />
        </main>
      </div>
    </div>
  </section>
</template>
