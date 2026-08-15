<script setup>
import { reactive } from "vue";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import logoApp from "@/assets/wellTrack.png";

const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const handleSubmit = () => {
  router.push({ name: "dashboard" });
};
</script>

<template>
  <section class="login-page">
    <div class="flex h-screen items-center justify-center text-[#573e33]">
      <div class="hidden h-screen w-3/4 lg:block">
        <img :src="logoApp" alt="WellTrack" class="h-full w-full object-cover" />
      </div>

      <div class="w-full p-8 md:p-52 lg:w-1/2 lg:p-36">
        <h1 class="mb-4 text-2xl font-semibold">Inicio de sesión</h1>

        <form action="#" method="POST" @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="username" class="block text-[#573e33]/75">Usuario</label>
            <input
              v-model="form.email"
              type="email"
              id="username"
              name="username"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="email"
            />
          </div>

          <div class="mb-4">
            <label for="password" class="block text-[#573e33]/75">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              id="password"
              name="password"
              class="w-full rounded-md border border-[#b98a81]/45 px-3 py-2 focus:border-[#573e33] focus:outline-none"
              autocomplete="current-password"
            />
          </div>

          <div class="mb-4 flex items-center">
            <input type="checkbox" id="remember" name="remember" class="accent-[#573e33]" />
            <label for="remember" class="ml-2 text-[#573e33]/75">Recordarme</label>
          </div>

          <div class="mb-6 text-[#573e33]">
            <a href="#" class="hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            class="w-full rounded-md bg-[#573e33] px-4 py-2 font-semibold text-white transition hover:bg-[#b98a81]"
          >
            Entrar
          </button>
        </form>

        <div class="mt-6 text-center text-[#573e33]">
          <span>¿Todavía no eres usuario?</span>
          <RouterLink :to="{ name: 'register' }" class="ml-1 font-semibold hover:underline">
            ¡Regístrate ahora!
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
