<script setup>
import { computed } from "vue";
import { onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import SideBar from "@/components/SideBar.vue";
import ToastHost from "@/components/ToastHost.vue";
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

const isAuthRoute = computed(() => route.name === "login" || route.name === "register");
</script>

<template>
  <div
    :class="[
      'min-h-screen bg-white text-[#573e33]',
      isAuthRoute ? 'block' : 'grid grid-cols-[260px_minmax(0,1fr)] max-[820px]:grid-cols-1',
    ]"
  >
    <SideBar v-if="!isAuthRoute" />

    <main :class="[isAuthRoute ? '' : 'min-w-0 p-8 max-[820px]:p-5']">
      <RouterView />
    </main>
    <ToastHost />
  </div>
</template>
