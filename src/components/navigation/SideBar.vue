<script setup>
import { ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack_logo.png";
import { useAuthStore } from "@/stores/authStore";
import { useGoalStore } from "@/stores/goalStore";
import { useNutritionStore } from "@/stores/nutritionStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const goalStore = useGoalStore();
const nutritionStore = useNutritionStore();
const isMenuOpen = ref(false);

// Al navegar en móvil cerramos el desplegable para devolver espacio al
// contenido de la nueva pantalla.
watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
  },
);

const handleLogout = () => {
  // Además de borrar el token, limpiamos las metas del usuario anterior para
  // que no aparezcan durante el siguiente inicio de sesión.
  goalStore.clearGoals();
  nutritionStore.clearEntries();
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
    class="sticky top-0 z-30 flex h-screen flex-col gap-7 border-r border-[#b98a81]/25 bg-white/90 px-5 py-7 backdrop-blur max-[820px]:h-auto max-[820px]:gap-4 max-[820px]:border-b max-[820px]:border-r-0 max-[820px]:px-5 max-[820px]:py-4"
  >
    <div class="flex items-center justify-between gap-4">
      <RouterLink
        :to="{ name: 'dashboard' }"
        class="flex min-w-0 items-center gap-3 text-[1.2rem] font-extrabold"
      >
        <img :src="logoApp" alt="WellTrack" class="max-h-12 max-w-full object-contain" />
      </RouterLink>

      <button
        type="button"
        class="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#b98a81]/35 text-2xl max-[820px]:inline-flex"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        aria-label="Abrir o cerrar navegación"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ isMenuOpen ? "×" : "☰" }}
      </button>
    </div>

    <div
      id="mobile-navigation"
      class="flex min-h-0 flex-1 flex-col gap-4 max-[820px]:flex-none"
      :class="isMenuOpen ? 'max-[820px]:flex' : 'max-[820px]:hidden'"
    >
      <nav class="grid gap-2 max-[820px]:grid-cols-2 max-[520px]:grid-cols-1" aria-label="Navegación principal">
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
        class="mt-auto rounded-lg px-3.5 py-3 text-left font-semibold text-[#573e33]/80 max-[820px]:mt-0"
        @click="handleLogout"
      >
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
