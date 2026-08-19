<script setup>
import { onMounted, reactive, watch } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useGoalStore } from "@/stores/goalStore";
import GoalsList from "@/components/goals/GoalsList.vue";
import GoalsSetup from "@/components/goals/GoalsSetup.vue";

const authStore = useAuthStore();
const toastStore = useToastStore();
const goalStore = useGoalStore();

// El perfil reutiliza exactamente la misma colección que el onboarding. Aquí
// se carga una vez para alimentar tanto el listado como las tarjetas nuevas.
onMounted(async () => {
  try {
    await goalStore.loadGoals();
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
});

const form = reactive({
  name: "",
  email: "",
  gender: "",
  birth_date: "",
  height: "",
  weight: "",
});

watch(
  () => authStore.user,
  (user) => {
    if (!user) {
      return;
    }

    Object.assign(form, {
      name: user.name ?? "",
      email: user.email ?? "",
      gender: user.gender ?? "",
      birth_date: user.birth_date ? String(user.birth_date).slice(0, 10) : "",
      height: user.height ?? "",
      weight: user.weight ?? "",
    });
  },
  { immediate: true },
);

const handleSubmit = async () => {
  try {
    await authStore.updateProfile({
      name: form.name,
      gender: form.gender || null,
      birth_date: form.birth_date || null,
      height: form.height === "" ? null : Number(form.height),
      weight: form.weight === "" ? null : Number(form.weight),
    });

    toastStore.notify("Perfil actualizado correctamente");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Perfil"
      title="Preferencias personales"
      description="Actualiza tus datos personales y biométricos."
    />

    <LoadingState v-if="authStore.isLoading && !authStore.user" />

    <BaseCard v-else>
      <form class="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1" @submit.prevent="handleSubmit">
        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-name">
          Nombre
          <input
            id="profile-name"
            v-model.trim="form.name"
            type="text"
            autocomplete="name"
            required
            maxlength="100"
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-email">
          Correo electrónico
          <input
            id="profile-email"
            v-model="form.email"
            type="email"
            disabled
            class="h-11 cursor-not-allowed rounded-lg border border-[#b98a81]/25 bg-[#f7f1ec] px-3 opacity-70"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-gender">
          Género
          <select
            id="profile-gender"
            v-model="form.gender"
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          >
            <option value="">Prefiero no indicarlo</option>
            <option value="female">Mujer</option>
            <option value="male">Hombre</option>
            <option value="non_binary">No binario</option>
            <option value="other">Otro</option>
          </select>
        </label>

        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-birth-date">
          Fecha de nacimiento
          <input
            id="profile-birth-date"
            v-model="form.birth_date"
            type="date"
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-height">
          Altura (cm)
          <input
            id="profile-height"
            v-model="form.height"
            type="number"
            min="50"
            max="300"
            step="0.1"
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold text-[#573e33]/75" for="profile-weight">
          Peso (kg)
          <input
            id="profile-weight"
            v-model="form.weight"
            type="number"
            min="20"
            max="500"
            step="0.1"
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="col-span-2 h-11 rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60 max-[680px]:col-span-1"
        >
          {{ authStore.isLoading ? "Guardando..." : "Guardar cambios" }}
        </button>
      </form>
    </BaseCard>

    <section class="grid gap-4">
      <div>
        <h2 class="text-2xl font-bold">Mis objetivos</h2>
        <p class="mt-2 text-[#573e33]/65">
          Consulta tus metas activas, complétalas o crea otras nuevas.
        </p>
      </div>

      <GoalsList />
    </section>

    <section class="grid gap-4">
      <div>
        <h2 class="text-2xl font-bold">Añadir objetivos</h2>
        <p class="mt-2 text-[#573e33]/65">
          Las metas activas no se muestran de nuevo para evitar duplicados.
        </p>
      </div>

      <GoalsSetup />
    </section>
  </section>
</template>
