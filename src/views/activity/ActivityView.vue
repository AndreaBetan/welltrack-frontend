<script setup>
import { computed, onMounted, ref } from "vue";
import { icons } from "@/icons";
import BaseCard from "@/components/ui/BaseCard.vue";
import { ConfirmModal, Modal } from "@/components/modals";
import { useActivityStore } from "@/stores/activityStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { todayLocalDate } from "@/utils/dateUtils";
import ActivityForm from "./components/ActivityForm.vue";
import ActivityHistory from "./components/ActivityHistory.vue";
import ActivitySummary from "./components/ActivitySummary.vue";
import { useActivityCatalog } from "./composables/useActivityCatalog";
import { useActivityForm } from "./composables/useActivityForm";
import { useActivityMetrics } from "./composables/useActivityMetrics";

const activityStore = useActivityStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const pendingDeleteId = ref(null);
const isDeleting = ref(false);
const userWeight = computed(() => authStore.user?.weight);
const entries = computed(() => activityStore.entries);

const { activityTypes, activitiesByCode, getActivity } = useActivityCatalog(activityStore);
const { summary } = useActivityMetrics(entries);
const {
  form,
  editForm,
  editingId,
  resetCreateForm,
  startEditing,
  cancelEditing,
  toPayload,
} = useActivityForm({
  weight: userWeight,
  getActivity,
});

const createActivity = async () => {
  try {
    await activityStore.addEntry(toPayload(form.value));
    resetCreateForm();
    toastStore.notify("Actividad registrada");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const updateActivity = async () => {
  try {
    await activityStore.updateEntry(editingId.value, toPayload(editForm.value));
    cancelEditing();
    toastStore.notify("Actividad actualizada");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const removeActivity = async () => {
  const entryId = pendingDeleteId.value;
  if (!entryId) return;

  isDeleting.value = true;
  try {
    await activityStore.deleteEntry(entryId);
    if (editingId.value === entryId) cancelEditing();
    pendingDeleteId.value = null;
    toastStore.notify("Actividad eliminada");
  } catch (error) {
    toastStore.notify(error.message, "error");
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      activityStore.loadEntries(),
      activityStore.loadActivityTypes(),
      authStore.user ? Promise.resolve() : authStore.loadCurrentUser(),
    ]);
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
});
</script>

<template>
  <section class="grid gap-6 text-[#573e33]">
    <header
      class="flex items-end justify-between gap-6 max-[720px]:items-start max-[720px]:flex-col"
    >
      <div>
        <p class="mb-2 text-sm font-extrabold uppercase tracking-[0.14em] text-[#c98274]">
          Movimiento
        </p>
        <h1 class="text-4xl font-extrabold tracking-[-0.03em] max-[640px]:text-3xl">
          Actividad física
        </h1>
        <p class="mt-3 text-[#573e33]/65">
          Registra tu actividad física, duración y energía gastada durante el día.
        </p>
      </div>
      <div
        class="flex min-w-60 items-center gap-4 rounded-2xl border border-[#b98a81]/25 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(87,62,51,0.06)] max-[420px]:w-full"
      >
        <span class="grid size-11 place-items-center rounded-full bg-red-50 text-red-500">
          <component :is="icons.common.calories" aria-hidden="true" class="size-6" />
        </span>
        <div>
          <p class="text-xs font-semibold text-[#573e33]/60">Esta semana</p>
          <strong class="block">{{ summary.sessions }} entrenamientos</strong>
          <span class="text-sm text-[#573e33]/65">{{ summary.calories }} kcal quemadas</span>
        </div>
      </div>
    </header>

    <BaseCard>
      <div class="mb-6 flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-full bg-[#f7eee8] text-[#9d6a5e]">
          <component :is="icons.common.person" aria-hidden="true" class="size-5" />
        </span>
        <h2 class="text-xl font-extrabold">Registrar nueva actividad</h2>
      </div>
      <ActivityForm
        v-model="form"
        :activity-types="activityTypes"
        :loading="activityStore.isCreating"
        :types-loading="activityStore.isTypesLoading"
        :max-date="todayLocalDate()"
        @submit="createActivity"
      />
    </BaseCard>

    <ActivityHistory
      :entries="activityStore.entries"
      :activities-by-code="activitiesByCode"
      :loading="activityStore.isFetching"
      @edit="startEditing"
      @delete="pendingDeleteId = $event"
    />

    <ActivitySummary :summary="summary" />

    <Modal
      :open="Boolean(editingId)"
      title="Editar actividad"
      :loading="Boolean(activityStore.updatingId)"
      @update:open="cancelEditing"
    >
      <ActivityForm
        v-model="editForm"
        id-prefix="edit-activity"
        :activity-types="activityTypes"
        :loading="Boolean(activityStore.updatingId)"
        :types-loading="activityStore.isTypesLoading"
        :max-date="todayLocalDate()"
        submit-label="Guardar cambios"
        cancel-label="Cancelar"
        @submit="updateActivity"
        @cancel="cancelEditing"
      />
    </Modal>

    <ConfirmModal
      :open="Boolean(pendingDeleteId)"
      title="Eliminar actividad"
      message="Esta acción eliminará el registro de actividad de tu historial. ¿Quieres continuar?"
      confirm-label="Eliminar"
      :loading="isDeleting"
      destructive
      @update:open="pendingDeleteId = null"
      @confirm="removeActivity"
    />
  </section>
</template>
