<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack_logo.png";
import { useAuthStore } from "@/stores/authStore";
import { useGoalStore } from "@/stores/goalStore";
import { useNutritionStore } from "@/stores/nutritionStore";
import { useActivityStore } from "@/stores/activityStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useRecommendationStore } from "@/stores/recommendationStore";
import { useSleepStore } from "@/stores/sleepStore";
import { useStatisticsStore } from "@/stores/statisticsStore";
import { icons } from "@/icons";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const goalStore = useGoalStore();
const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();
const dashboardStore = useDashboardStore();
const recommendationStore = useRecommendationStore();
const sleepStore = useSleepStore();
const statisticsStore = useStatisticsStore();
const isMenuOpen = ref(false);

const userName = computed(() => authStore.user?.name?.trim() || "Mi perfil");
const userInitials = computed(() =>
  userName.value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(""),
);

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
  activityStore.clearEntries();
  sleepStore.clearEntries();
  recommendationStore.clearRecommendations();
  dashboardStore.clearDashboard();
  statisticsStore.clearStatistics();
  authStore.logout();
  router.push({ name: "login" });
};

const navigationItems = [
  { name: "Inicio", route: "dashboard", icon: icons.navigation.home },
  { name: "Alimentación", route: "nutrition", icon: icons.navigation.nutrition },
  { name: "Actividad física", route: "activity", icon: icons.navigation.activity },
  { name: "Sueño", route: "sleep", icon: icons.navigation.sleep },
  { name: "Recomendaciones", route: "recommendations", icon: icons.navigation.recommendations },
  { name: "Progreso", route: "progress", icon: icons.navigation.progress },
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
        <component
          :is="isMenuOpen ? icons.actions.close : icons.navigation.menu"
          :size="22"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      id="mobile-navigation"
      class="flex min-h-0 flex-1 flex-col gap-4 max-[820px]:flex-none"
      :class="isMenuOpen ? 'max-[820px]:flex' : 'max-[820px]:hidden'"
    >
      <nav
        class="grid gap-3 max-[820px]:grid-cols-2 max-[520px]:grid-cols-1"
        aria-label="Navegación principal"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.route"
          :to="{ name: item.route }"
          class="flex min-h-\[52px\] items-center gap-4 rounded-xl px-4 py-3 font-semibold text-[#573e33]/75 transition hover:bg-[#f7f1ec] [&.router-link-active]:bg-[#f1e4df] [&.router-link-active]:text-[#573e33]"
        >
          <component :is="item.icon" :size="21" :stroke-width="1.8" aria-hidden="true" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="mt-auto grid gap-4 max-[820px]:mt-0">
        <RouterLink
          :to="{ name: 'profile' }"
          class="flex items-center gap-3 rounded-xl border border-[#b98a81]/30 bg-white p-3 text-[#573e33] transition hover:bg-[#fbf7f4]"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full bg-[#ead3c9] text-sm font-extrabold"
          >
            {{ userInitials }}
          </span>
          <span class="min-w-0 flex-1">
            <strong class="block truncate text-sm">{{ userName }}</strong>
            <small class="block text-xs text-[#573e33]/60">Editar perfil</small>
          </span>
        </RouterLink>

        <button
          type="button"
          class="flex items-center gap-4 rounded-xl px-4 py-3 text-left font-semibold text-[#573e33]/80 transition hover:bg-[#f7f1ec]"
          @click="handleLogout"
        >
          <component
            :is="icons.navigation.logout"
            :size="21"
            :stroke-width="1.8"
            aria-hidden="true"
          />
          Cerrar sesión
        </button>
      </div>
    </div>
  </aside>
</template>
