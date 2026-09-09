<script setup>
import { FormField } from "@/components/forms";
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
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

    toastStore.notify("Sesión iniciada");
    router.push({
      name: goals.length ? "dashboard" : "goals-onboarding",
    });
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <AuthLayout title="Inicio de sesión">
    <form class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
      <FormField
        label="Correo electrónico"
        id="login-email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        required
      />
      <FormField
        label="Contraseña"
        id="login-password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        required
      />
      <div class="-mt-1 text-right">
        <RouterLink
          :to="{ name: 'forgot-password' }"
          class="text-sm font-bold text-[#573e33] hover:underline"
        >
          ¿Has olvidado tu contraseña?
        </RouterLink>
      </div>
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="mt-2 h-11 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isLoading ? "Entrando" : "Entrar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-[#573e33]/70">
      ¿Todavía no eres usuario?
      <RouterLink :to="{ name: 'register' }" class="font-bold text-[#573e33] hover:underline">
        Regístrate
      </RouterLink>
    </p>
  </AuthLayout>
</template>
