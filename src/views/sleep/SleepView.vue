<script setup>
import { computed, onMounted, ref } from "vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { ConfirmModal, Modal } from "@/components/modals";
import { useSleepStore } from "@/stores/sleepStore";
import { useToastStore } from "@/stores/toastStore";
import { todayLocalDate } from "@/utils/dateUtils";
import SleepForm from "./components/SleepForm.vue";
import SleepHistory from "./components/SleepHistory.vue";
import SleepSummary from "./components/SleepSummary.vue";
import { useSleepForm } from "./composables/useSleepForm";
import { useSleepMetrics } from "./composables/useSleepMetrics";

const sleepStore = useSleepStore();
const toastStore = useToastStore();
const pendingDeleteId = ref(null);
const isDeleting = ref(false);
const entries = computed(() => sleepStore.entries);

const { averageDuration } = useSleepMetrics(entries);
const {
  form,
  editForm,
  editingId,
  resetCreateForm,
  startEditing,
  cancelEditing,
  toPayload,
} = useSleepForm();

const createEntry = async () => {
  try {
    await sleepStore.addEntry(toPayload(form.value));
    resetCreateForm();
    toastStore.notify("Sueño registrado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const updateEntry = async () => {
  try {
    await sleepStore.updateEntry(editingId.value, toPayload(editForm.value));
    cancelEditing();
    toastStore.notify("Registro de sueño actualizado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const deleteEntry = async () => {
  if (!pendingDeleteId.value) return;
  isDeleting.value = true;
  try {
    await sleepStore.deleteEntry(pendingDeleteId.value);
    pendingDeleteId.value = null;
    toastStore.notify("Registro de sueño eliminado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  try {
    await Promise.all([sleepStore.loadEntries(), sleepStore.loadFactors()]);
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
});
</script>

<template>
  <section class="grid gap-7">
    <PageHeader
      eyebrow="Descanso"
      title="Sueño"
      description="Registra tus horarios, calidad percibida y factores relacionados con el descanso."
    />

    <SleepForm
      v-model="form"
      title="Registrar descanso"
      :factors="sleepStore.factors"
      :loading="sleepStore.isCreating"
      :factors-loading="sleepStore.isFactorsLoading"
      :max-date="todayLocalDate()"
      @submit="createEntry"
    />

    <SleepSummary
      :last-duration="sleepStore.lastEntry?.duration_minutes"
      :average-duration="averageDuration"
      :average-quality="sleepStore.averageQuality"
    />

    <SleepHistory
      :entries="sleepStore.entries"
      :loading="sleepStore.isFetching"
      @edit="startEditing"
      @delete="pendingDeleteId = $event"
    />

    <Modal
      :open="Boolean(editingId)"
      title="Editar descanso"
      :loading="Boolean(sleepStore.updatingId)"
      @update:open="cancelEditing"
    >
      <SleepForm
        v-model="editForm"
        id-prefix="edit-sleep"
        :card="false"
        :factors="sleepStore.factors"
        :loading="Boolean(sleepStore.updatingId)"
        :factors-loading="sleepStore.isFactorsLoading"
        :max-date="todayLocalDate()"
        submit-label="Guardar cambios"
        cancel-label="Cancelar"
        @submit="updateEntry"
        @cancel="cancelEditing"
      />
    </Modal>

    <ConfirmModal
      :open="Boolean(pendingDeleteId)"
      title="Eliminar registro de sueño"
      message="Esta acción eliminará el registro de tu historial. ¿Quieres continuar?"
      confirm-label="Eliminar"
      :loading="isDeleting"
      destructive
      @update:open="pendingDeleteId = null"
      @confirm="deleteEntry"
    />
  </section>
</template>
