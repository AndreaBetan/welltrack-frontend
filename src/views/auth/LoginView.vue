<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack.png";
import { useToastStore } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";
import { useGoalStore } from "@/stores/goalStore";

const router = useRouter();
const authStore = useAuthStore();
const goalStore = useGoalStore();
const toastStore = useToastStore();
const form = reactive({ email: "", password: "" });

const handleSubmit = async () => {
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });

    // Los usuarios existentes van al dashboard. Los que todavía no tienen
    // objetivos pasan por la configuración inicial.
    const goals = await goalStore.loadGoals();

    toastStore.notify("Sesion iniciada");
    router.push({
      name: goals.length ? "dashboard" : "goals-onboarding",
    });
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <section class="min-h-screen bg-white text-[#573e33]">
    <div class="grid min-h-screen grid-cols-2 max-[980px]:grid-cols-1">
      <img :src="logoApp" alt="WellTrack" class="h-full w-full object-cover max-[980px]:hidden" />

      <div class="flex items-center justify-center px-8 py-12">
        <div class="w-full max-w-md">
          <p class="mb-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#b98a81]">
            WellTrack
          </p>
          <h1 class="text-3xl font-extrabold">Inicio de sesion</h1>

          <form class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
            <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="login-email">
              Correo electronico
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
              />
            </label>
            <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="login-password">
              Contrasena
              <input
                id="login-password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
              />
            </label>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="mt-2 h-11 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ authStore.isLoading ? "Entrando" : "Entrar" }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-[#573e33]/70">
            Todavia no eres usuario?
            <RouterLink :to="{ name: 'register' }" class="font-bold text-[#573e33] hover:underline"
              >Registrate</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
