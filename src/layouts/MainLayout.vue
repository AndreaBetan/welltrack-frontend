<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
</script>

<template>
  <div class="grid min-h-screen grid-cols-[260px_minmax(0,1fr)] bg-white text-[#573e33] max-[820px]:grid-cols-1">
    <SideBar />
    <main class="min-w-0 p-8 max-[820px]:p-5">
      <RouterView />
    </main>
  </div>
</template>
