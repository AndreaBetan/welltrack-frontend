<script setup>
import SideBar from "@/components/navigation/SideBar.vue";
</script>

<template>
  <div class="grid min-h-screen grid-cols-[260px_minmax(0,1fr)] bg-white text-[#573e33] max-[820px]:grid-cols-1">
    <SideBar />
    <main class="min-w-0 p-8 max-[820px]:p-5 max-[480px]:p-4">
      <slot />
    </main>
  </div>
</template>
