<script setup>
import { computed } from "vue";
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import ToastHost from "@/components/feedback/ToastHost.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.loadCurrentUser();
    } catch {
      // loadCurrentUser elimina la sesión si el token no es válido.
    }
  }
});

const route = useRoute();

// Login, registro y onboarding ocupan toda la pantalla y no muestran todavía
// la navegación principal de la aplicación.
const isFullPageRoute = computed(() =>
  ["login", "register", "goals-onboarding"].includes(route.name),
);
</script>

<template>
  <div v-if="isFullPageRoute" class="min-h-screen bg-white text-[#573e33]">
    <RouterView />
  </div>
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
  <ToastHost />
</template>
