<script setup>
import { DatePicker, FormField, Select } from "@/components/forms";
import { toDateOnlyValue } from "@/utils/dateUtils";
import { computed, onMounted, reactive, ref, watch } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useGoalStore } from "@/stores/goalStore";
import GoalsList from "@/components/goals/GoalsList.vue";
import GoalsSetup from "@/components/goals/GoalsSetup.vue";
import { icons } from "@/icons";

const authStore = useAuthStore();
const toastStore = useToastStore();
const goalStore = useGoalStore();
const isEditingProfile = ref(false);

const supportedGoalTypes = [
  "daily_activity_minutes",
  "nightly_sleep_hours",
  "daily_calories",
  "target_weight",
];

// Ocultamos el bloque cuando las cuatro categorías ya tienen una meta activa.
// Una categoría completada o cancelada vuelve a quedar disponible.
const hasAvailableGoalTypes = computed(() => {
  const activeTypes = new Set(
    goalStore.goals.filter((goal) => goal.status === "active").map((goal) => goal.goal_type),
  );
  return supportedGoalTypes.some((type) => !activeTypes.has(type));
});

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

const copyUserToForm = () => {
  const user = authStore.user;
  if (!user) return;

  Object.assign(form, {
    name: user.name ?? "",
    email: user.email ?? "",
    gender: user.gender ?? "",
    birth_date: user.birth_date ? toDateOnlyValue(user.birth_date) : "",
    height: user.height ?? "",
    weight: user.weight ?? "",
  });
};

watch(
  () => authStore.user,
  copyUserToForm,
  { immediate: true },
);

const genderLabels = {
  female: "Mujer",
  male: "Hombre",
  non_binary: "No binario",
  other: "Otro",
};

const genderOptions = [
  { value: "", label: "Prefiero no indicarlo" },
  ...Object.entries(genderLabels).map(([value, label]) => ({ value, label })),
];

const cancelEditing = () => {
  copyUserToForm();
  isEditingProfile.value = false;
};

const handleSubmit = async () => {
  try {
    await authStore.updateProfile({
      name: form.name.trim(),
      gender: form.gender || null,
      birth_date: form.birth_date || null,
      height: form.height === "" ? null : Number(form.height),
      weight: form.weight === "" ? null : Number(form.weight),
    });

    isEditingProfile.value = false;
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

    <BaseCard v-else class="p-5!">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold">Datos personales</h2>
          <p class="mt-1 text-sm text-[#573e33]/55">Información utilizada para personalizar tu experiencia.</p>
        </div>
        <button
          v-if="!isEditingProfile"
          type="button"
          class="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#b98a81]/30 px-4 text-sm font-bold transition hover:bg-[#f7f1ec]"
          @click="isEditingProfile = true"
        >
          <component :is="icons.actions.edit" class="size-4" aria-hidden="true" />
          Editar
        </button>
      </div>

      <dl v-if="!isEditingProfile" class="grid grid-cols-3 gap-x-8 gap-y-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Nombre</dt>
          <dd class="mt-1 font-semibold">{{ form.name || "No indicado" }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Correo electrónico</dt>
          <dd class="mt-1 truncate font-semibold">{{ form.email || "No indicado" }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Género</dt>
          <dd class="mt-1 font-semibold">{{ genderLabels[form.gender] || "Prefiero no indicarlo" }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Fecha de nacimiento</dt>
          <dd class="mt-1 font-semibold">{{ form.birth_date || "No indicada" }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Altura</dt>
          <dd class="mt-1 font-semibold">{{ form.height ? `${form.height} cm` : "No indicada" }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase tracking-wide text-[#573e33]/45">Peso</dt>
          <dd class="mt-1 font-semibold">{{ form.weight ? `${form.weight} kg` : "No indicado" }}</dd>
        </div>
      </dl>

      <form v-else class="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1" @submit.prevent="handleSubmit">
        <FormField
          id="profile-name"
          v-model="form.name"
          label="Nombre"
          autocomplete="name"
          maxlength="100"
        />
        <FormField
          id="profile-email"
          v-model="form.email"
          label="Correo electrónico"
          type="email"
          disabled
        />
        <Select
          id="profile-gender"
          v-model="form.gender"
          label="Género"
          :options="genderOptions"
        />
        <DatePicker
          id="profile-birth-date"
          v-model="form.birth_date"
          label="Fecha de nacimiento"
          clearable
        />
        <FormField
          id="profile-height"
          v-model="form.height"
          label="Altura (cm)"
          type="number"
          min="50"
          max="300"
          step="0.1"
          :required="false"
        />
        <FormField
          id="profile-weight"
          v-model="form.weight"
          label="Peso (kg)"
          type="number"
          min="20"
          max="500"
          step="0.1"
          :required="false"
        />

        <div class="col-span-2 flex justify-end gap-3 max-[680px]:col-span-1">
          <button
            type="button"
            :disabled="authStore.isLoading"
            class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold transition hover:bg-[#f7f1ec] disabled:opacity-60"
            @click="cancelEditing"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="h-11 rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ authStore.isLoading ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </form>
    </BaseCard>

    <section id="objetivos" class="grid scroll-mt-6 gap-6">
      <GoalsList />
      <GoalsSetup v-if="hasAvailableGoalTypes" />
    </section>
  </section>
</template>
