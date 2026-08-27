<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import { useAuthStore } from "@/stores/authStore";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const token = typeof route.query.token === "string" ? route.query.token : "";
const form = reactive({ password: "", confirmPassword: "" });
const errorMessage = ref("");
const isComplete = ref(false);
const hasValidTokenFormat = computed(() => TOKEN_PATTERN.test(token));

onMounted(() => {
  if (route.query.token) {
    router.replace({ name: "reset-password" });
  }
});

const handleSubmit = async () => {
  errorMessage.value = "";

  if (form.password !== form.confirmPassword) {
    errorMessage.value = "Las contraseñas no coinciden.";
    return;
  }

  if (new TextEncoder().encode(form.password).length > 72) {
    errorMessage.value = "La contraseña no puede superar 72 bytes.";
    return;
  }

  try {
    await authStore.resetPassword({ token, password: form.password });
    form.password = "";
    form.confirmPassword = "";
    isComplete.value = true;
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
    title="Crear nueva contraseña"
    description="Elige una contraseña de al menos 8 caracteres que no utilices en otros servicios."
  >
    <div
      v-if="!hasValidTokenFormat"
      class="mt-8 rounded-xl border border-red-200 bg-red-50 p-5"
      role="alert"
    >
      <h2 class="font-extrabold text-red-900">El enlace no es válido o ha caducado</h2>
      <p class="mt-2 text-sm leading-6 text-red-900/75">
        Solicita un enlace nuevo para poder restablecer tu contraseña.
      </p>
      <RouterLink
        :to="{ name: 'forgot-password' }"
        class="mt-4 inline-block text-sm font-bold text-red-900 underline underline-offset-4"
      >
        Solicitar otro enlace
      </RouterLink>
    </div>

    <div
      v-else-if="isComplete"
      class="mt-8 rounded-xl border border-[#b98a81]/30 bg-[#f7eee8] p-5"
      role="status"
    >
      <h2 class="font-extrabold">Contraseña actualizada</h2>
      <p class="mt-2 text-sm leading-6 text-[#573e33]/75">
        Ya puedes iniciar sesión con tu nueva contraseña.
      </p>
      <RouterLink
        :to="{ name: 'login' }"
        class="mt-5 inline-flex h-11 items-center rounded-lg bg-[#573e33] px-5 text-sm font-bold text-white transition hover:bg-[#6d4d40]"
      >
        Ir al inicio de sesión
      </RouterLink>
    </div>

    <form v-else class="mt-8 grid gap-4" @submit.prevent="handleSubmit">
      <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="reset-password">
        Nueva contraseña
        <input
          id="reset-password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? 'reset-error' : 'password-help'"
          class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-[#573e33] outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
        />
        <span id="password-help" class="text-xs font-normal">Mínimo 8 caracteres.</span>
      </label>

      <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="confirm-password">
        Confirmar nueva contraseña
        <input
          id="confirm-password"
          v-model="form.confirmPassword"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? 'reset-error' : undefined"
          class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-[#573e33] outline-none transition focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
        />
      </label>

      <p v-if="errorMessage" id="reset-error" class="text-sm text-red-700" role="alert">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="mt-2 h-11 rounded-lg bg-[#573e33] font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isLoading ? "Guardando..." : "Guardar contraseña" }}
      </button>
    </form>
  </AuthLayout>
</template>
