<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import GoalsSetup from "@/components/goals/GoalsSetup.vue";
import { useGoalStore } from "@/stores/goalStore";
import { useToastStore } from "@/stores/toastStore";

const router = useRouter();
const goalStore = useGoalStore();
const toastStore = useToastStore();

onMounted(async () => {
  try {
    const goals = await goalStore.loadGoals();

    // Si alguien con metas ya configuradas abre esta URL manualmente, no debe
    // repetir el onboarding ni crear objetivos activos duplicados.
    if (goals.length) {
      router.replace({ name: "dashboard" });
    }
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
});

const finishOnboarding = () => {
  router.push({ name: "dashboard" });
};
</script>

<template>
  <section class="min-h-screen bg-[#f7f1ec] px-6 py-12 text-[#573e33] max-[640px]:px-4 max-[640px]:py-8">
    <div class="mx-auto grid w-full max-w-5xl gap-8">
      <PageHeader
        eyebrow="Primeros pasos"
        title="¿Qué quieres conseguir?"
        description="Selecciona uno o varios objetivos. Podrás modificarlos más adelante desde tu perfil."
      />

      <GoalsSetup onboarding @completed="finishOnboarding" />
    </div>
  </section>
</template>
