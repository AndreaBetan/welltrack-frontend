<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack.png";
import { useToastStore } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();
const form = reactive({ name: "", email: "", password: "", confirmPassword: "" });

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    toastStore.notify("Las contrasenas no coinciden", "error");
    return;
  }
  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    toastStore.notify("Cuenta creada");
    router.push({ name: "dashboard" });
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
          <h1 class="text-3xl font-extrabold">Crear cuenta</h1>

          <form class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
            <input
              v-model="form.name"
              type="text"
              autocomplete="name"
              required
              placeholder="Nombre"
              class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
            />
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              placeholder="Correo electronico"
              class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
            />
            <input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              placeholder="Contrasena"
              class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
            />
            <input
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              placeholder="Confirmar contrasena"
              class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
            />
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="mt-2 h-11 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ authStore.isLoading ? "Creando cuenta..." : "Registrarme" }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-[#573e33]/70">
            Ya tienes cuenta?
            <RouterLink :to="{ name: 'login' }" class="font-bold text-[#573e33] hover:underline"
              >Inicia sesion</RouterLink
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
