<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack.png";

const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleSubmit = () => {
  router.push({ name: "dashboard" });
};
</script>

<template>
  <section class="register-page">
    <div class="flex min-h-screen items-center justify-center text-[#573e33]">
      <div class="hidden min-h-screen w-3/4 lg:block">
        <img :src="logoApp" alt="WellTrack" class="h-full w-full object-cover" />
      </div>

      <div class="w-full p-8 md:p-52 lg:w-1/2 lg:p-36">
        <h1 class="mb-4 text-2xl font-semibold">Crear cuenta</h1>
        <p class="mb-6 text-[#573e33]/75">Completa tus datos para empezar a usar WellTrack.</p>

        <form action="#" method="POST" @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block text-[#573e33]/75">Nombre</label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              name="name"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="name"
            />
          </div>

          <div class="mb-4">
            <label for="email" class="block text-[#573e33]/75">Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              name="email"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="email"
            />
          </div>

          <div class="mb-4">
            <label for="register-password" class="block text-[#573e33]/75">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              id="register-password"
              name="password"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="new-password"
            />
          </div>

          <div class="mb-6">
            <label for="confirm-password" class="block text-[#573e33]/75">
              Confirmar contraseña
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              id="confirm-password"
              name="confirm-password"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="new-password"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded-md bg-[#573e33] px-4 py-2 font-semibold text-white transition hover:bg-[#b98a81]"
          >
            Registrarme
          </button>
        </form>

        <div class="mt-6 text-center text-[#573e33]">
          <span>¿Ya tienes cuenta?</span>
          <RouterLink :to="{ name: 'login' }" class="ml-1 font-semibold hover:underline">
            Inicia sesión
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
