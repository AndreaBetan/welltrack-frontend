<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const email = ref("");
const errorMessage = ref("");
const isSubmitted = ref(false);

const handleSubmit = async () => {
  errorMessage.value = "";

  try {
    await authStore.requestPasswordReset(email.value);
    isSubmitted.value = true;
  } catch (error) {
    errorMessage.value =
      error.status === 429
        ? "Has realizado demasiadas solicitudes. Inténtalo de nuevo más tarde."
        : error.message;
  }
};
</script>

<template>
  <AuthLayout
    title="Recuperar contraseña"
    description="Introduce el correo asociado a tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
  >
    <div
      v-if="isSubmitted"
      class="mt-8 rounded-xl border border-[#b98a81]/30 bg-[#f7eee8] p-5"
      role="status"
      tabindex="-1"
    >
      <h2 class="font-extrabold">Revisa tu correo</h2>
      <p class="mt-2 text-sm leading-6 text-[#573e33]/75">
        Si existe una cuenta con ese correo, recibirás las instrucciones para restablecer tu
        contraseña. El enlace caduca en 30 minutos.
      </p>
      <button
        type="button"
        class="mt-4 text-sm font-bold text-[#573e33] underline underline-offset-4"
        @click="isSubmitted = false"
      >
        Probar con otro correo
      </button>
    </div>

    <form v-else class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
      <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="forgot-email">
        Correo electrónico
        <input
          id="forgot-email"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          maxlength="255"
          required
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? 'forgot-error' : undefined"
          class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-[#573e33] outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
        />
      </label>

      <p v-if="errorMessage" id="forgot-error" class="text-sm text-red-700" role="alert">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="mt-2 h-11 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isLoading ? "Enviando..." : "Enviar enlace" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-[#573e33]/70">
      <RouterLink :to="{ name: 'login' }" class="font-bold text-[#573e33] hover:underline">
        Volver al inicio de sesión
      </RouterLink>
    </p>
  </AuthLayout>
</template>
