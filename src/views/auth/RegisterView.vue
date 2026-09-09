<script setup>
import { FormField } from "@/components/forms";
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import { useToastStore } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const toastStore = useToastStore();
const authStore = useAuthStore();
const form = reactive({ name: "", email: "", password: "", confirmPassword: "" });

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    toastStore.notify("Las contraseñas no coinciden", "error");
    return;
  }
  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    toastStore.notify("Cuenta creada");
    // Un usuario recién creado todavía no tiene metas: comienza por el
    // onboarding antes de mostrarle un dashboard sin personalizar.
    router.push({ name: "goals-onboarding" });
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <AuthLayout title="Crear cuenta">
    <form class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
      <FormField
        id="register-name"
        label="Nombre"
        v-model="form.name"
        type="text"
        autocomplete="name"
        required
      />
      <FormField
        id="register-email"
        label="Correo electrónico"
        v-model="form.email"
        type="email"
        autocomplete="email"
        required
      />
      <FormField
        id="register-password"
        label="Contraseña"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        required
      />
      <FormField
        id="register-confirmPassword"
        label="Confirmar contraseña"
        v-model="form.confirmPassword"
        type="password"
        autocomplete="new-password"
        required
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
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'login' }" class="font-bold text-[#573e33] hover:underline">
        Inicia sesión
      </RouterLink>
    </p>
  </AuthLayout>
</template>
