<script setup>
import { RouterLink, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack_logo.png";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "login" });
};

const navigationItems = [
  { name: "Mi página de inicio", route: "dashboard" },
  { name: "Alimentación", route: "nutrition" },
  { name: "Actividad física", route: "activity" },
  { name: "Sueño", route: "sleep" },
  { name: "Recomendaciones", route: "recommendations" },
  { name: "Perfil", route: "profile" },
];
</script>

<template>
  <aside
    class="sticky top-0 flex h-screen flex-col gap-7 border-r border-[#b98a81]/25 bg-white/85 px-5 py-7 backdrop-blur max-[820px]:static max-[820px]:h-auto max-[820px]:p-[18px]"
  >
    <RouterLink
      :to="{ name: 'dashboard' }"
      class="flex items-center gap-3 text-[1.2rem] font-extrabold"
    >
      <img :src="logoApp" alt="WellTrack" />
      <!-- <span>WellTrack</span> -->
    </RouterLink>

    <nav class="grid gap-2 max-[820px]:grid-cols-2" aria-label="Navegacion principal">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.route"
        :to="{ name: item.route }"
        class="rounded-lg px-3.5 py-3 font-semibold text-[#573e33]/75 transition hover:bg-[#f7f1ec] [&.router-link-active]:bg-[#b98a81]/25 [&.router-link-active]:text-[#573e33]"
      >
        {{ item.name }}
      </RouterLink>
    </nav>

    <button
      type="button"
      class="mt-auto rounded-lg px-3.5 py-3 font-semibold text-[#573e33]/80 text-start"
      @click="handleLogout"
    >
      Cerrar sesion
    </button>
  </aside>
</template>
