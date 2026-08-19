<script setup>
import { reactive, ref } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { ConfirmModal } from "@/components/modals";
import { useGoalStore } from "@/stores/goalStore";
import { useToastStore } from "@/stores/toastStore";

const goalStore = useGoalStore();
const toastStore = useToastStore();
const editingGoalId = ref(null);
const pendingDeleteId = ref(null);
const isDeleting = ref(false);

const editForm = reactive({
  goal_type: "",
  target_value: "",
  start_date: "",
  end_date: "",
  status: "active",
});

const goalLabels = {
  daily_calories: "Calorías diarias",
  daily_activity_minutes: "Actividad diaria",
  nightly_sleep_hours: "Horas de sueño",
  target_weight: "Peso objetivo",
};

const statusLabels = {
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const unitLabels = {
  daily_calories: "kcal",
  daily_activity_minutes: "min",
  nightly_sleep_hours: "h",
  target_weight: "kg",
};

const normalizeDate = (date) => String(date).slice(0, 10);

const startEditing = (goal) => {
  // Se copia la tarjeta al formulario para no modificar el store antes de que
  // el backend confirme el PATCH.
  editingGoalId.value = goal.id;
  Object.assign(editForm, {
    goal_type: goal.goal_type,
    target_value: Number(goal.target_value),
    start_date: normalizeDate(goal.start_date),
    end_date: normalizeDate(goal.end_date),
    status: goal.status,
  });
};

const cancelEditing = () => {
  editingGoalId.value = null;
};

const saveGoal = async (goalId) => {
  if (editForm.end_date < editForm.start_date) {
    toastStore.notify("La fecha final no puede ser anterior a la inicial", "error");
    return;
  }

  // No permitimos dos metas activas de la misma categoría para el usuario.
  const duplicateActiveGoal = goalStore.goals.some(
    (goal) =>
      goal.id !== goalId &&
      goal.status === "active" &&
      editForm.status === "active" &&
      goal.goal_type === editForm.goal_type,
  );

  if (duplicateActiveGoal) {
    toastStore.notify("Ya existe un objetivo activo de esta categoría", "error");
    return;
  }

  try {
    await goalStore.updateGoal(goalId, {
      goal_type: editForm.goal_type,
      target_value: Number(editForm.target_value),
      start_date: editForm.start_date,
      end_date: editForm.end_date,
      status: editForm.status,
    });
    editingGoalId.value = null;
    toastStore.notify("Objetivo actualizado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const completeGoal = async (goal) => {
  try {
    // El PATCH actual del backend valida el objeto completo; por eso se envían
    // también los campos que no cambian al marcar la meta como completada.
    await goalStore.updateGoal(goal.id, {
      goal_type: goal.goal_type,
      target_value: Number(goal.target_value),
      start_date: normalizeDate(goal.start_date),
      end_date: normalizeDate(goal.end_date),
      status: "completed",
    });
    toastStore.notify("Objetivo completado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const removeGoal = async () => {
  const goalId = pendingDeleteId.value;
  if (!goalId) return;

  isDeleting.value = true;
  try {
    await goalStore.deleteGoal(goalId);
    pendingDeleteId.value = null;
    toastStore.notify("Objetivo eliminado");
  } catch (error) {
    toastStore.notify(error.message, "error");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <LoadingState v-if="goalStore.isLoading && !goalStore.goals.length" />

  <div v-else-if="goalStore.goals.length" class="grid gap-4">
    <BaseCard v-for="goal in goalStore.goals" :key="goal.id">
      <form
        v-if="editingGoalId === goal.id"
        class="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1"
        @submit.prevent="saveGoal(goal.id)"
      >
        <label class="grid gap-2 text-sm font-semibold">
          Tipo de objetivo
          <select
            v-model="editForm.goal_type"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          >
            <option value="daily_calories">Calorías diarias</option>
            <option value="daily_activity_minutes">Actividad diaria</option>
            <option value="nightly_sleep_hours">Horas de sueño</option>
            <option value="target_weight">Peso objetivo</option>
          </select>
        </label>

        <label class="grid gap-2 text-sm font-semibold">
          Valor objetivo
          <input
            v-model="editForm.target_value"
            type="number"
            min="0.1"
            step="0.1"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold">
          Fecha de inicio
          <input
            v-model="editForm.start_date"
            type="date"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold">
          Fecha de finalización
          <input
            v-model="editForm.end_date"
            type="date"
            :min="editForm.start_date"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold">
          Estado
          <select
            v-model="editForm.status"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          >
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>

        <div class="flex items-end gap-2 max-[640px]:flex-col max-[640px]:items-stretch">
          <button
            type="submit"
            :disabled="goalStore.isLoading"
            class="h-11 flex-1 rounded-lg bg-[#573e33] px-4 font-bold text-white disabled:opacity-50"
          >
            {{ goalStore.isLoading ? "Guardando..." : "Guardar cambios" }}
          </button>
          <button
            type="button"
            :disabled="goalStore.isLoading"
            class="h-11 rounded-lg border border-[#b98a81]/35 px-4 font-bold"
            @click="cancelEditing"
          >
            Cancelar
          </button>
        </div>
      </form>

      <div v-else class="flex items-start justify-between gap-4 max-[640px]:flex-col">
        <div>
          <span class="text-xs font-extrabold uppercase tracking-[0.1em] text-[#b98a81]">
            {{ statusLabels[goal.status] ?? goal.status }}
          </span>
          <h3 class="mt-1 text-xl font-bold">
            {{ goalLabels[goal.goal_type] ?? goal.goal_type }}
          </h3>
          <p class="mt-2 font-semibold">
            {{ goal.target_value }} {{ unitLabels[goal.goal_type] ?? "" }}
          </p>
          <p class="mt-1 text-sm text-[#573e33]/65">
            {{ normalizeDate(goal.start_date) }} — {{ normalizeDate(goal.end_date) }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2 max-[640px]:w-full">
          <button
            type="button"
            :disabled="goalStore.isLoading"
            class="rounded-lg border border-[#b98a81]/35 px-4 py-2 text-sm font-bold disabled:opacity-50 max-[420px]:flex-1"
            @click="startEditing(goal)"
          >
            Editar
          </button>
          <button
            v-if="goal.status === 'active'"
            type="button"
            :disabled="goalStore.isLoading"
            class="rounded-lg bg-[#573e33] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 max-[420px]:flex-1"
            @click="completeGoal(goal)"
          >
            Completar
          </button>
          <button
            type="button"
            :disabled="goalStore.isLoading"
            class="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50 max-[420px]:w-full"
            @click="pendingDeleteId = goal.id"
          >
            Eliminar
          </button>
        </div>
      </div>
    </BaseCard>
  </div>

  <EmptyState
    v-else
    title="Todavía no tienes objetivos"
    description="Selecciona una o varias tarjetas para personalizar tu seguimiento."
  />

  <ConfirmModal
    :open="Boolean(pendingDeleteId)"
    title="Eliminar objetivo"
    message="El objetivo dejará de aparecer en tu seguimiento. ¿Quieres continuar?"
    confirm-label="Eliminar"
    :loading="isDeleting"
    destructive
    @update:open="pendingDeleteId = null"
    @confirm="removeGoal"
  />
</template>
