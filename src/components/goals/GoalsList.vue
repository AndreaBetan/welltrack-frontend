<script setup>
import { computed, reactive, ref } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import DataTable from "@/components/data/DataTable.vue";
import MacroDistributionFields from "@/components/goals/MacroDistributionFields.vue";
import { ConfirmModal, Modal } from "@/components/modals";
import { icons } from "@/icons";
import { useGoalStore } from "@/stores/goalStore";
import { useToastStore } from "@/stores/toastStore";

const goalStore = useGoalStore();
const toastStore = useToastStore();
const editingGoalId = ref(null);
const pendingDeleteId = ref(null);
const isDeleting = ref(false);
const showHistory = ref(false);
const useMacroDistribution = ref(false);
const editingHadDistribution = ref(false);
const macroDistribution = ref({
  carbs_percentage: 50,
  protein_percentage: 20,
  fat_percentage: 30,
});

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

const goalStyles = {
  daily_calories: {
    icon: icons.goals.nutrition,
    accent: "border-l-[#e9a595]",
    iconClass: "bg-[#fce9e4] text-[#b56f61]",
  },
  daily_activity_minutes: {
    icon: icons.goals.activity,
    accent: "border-l-[#8fd1a1]",
    iconClass: "bg-emerald-50 text-emerald-700",
  },
  nightly_sleep_hours: {
    icon: icons.goals.sleep,
    accent: "border-l-[#c2a6ef]",
    iconClass: "bg-purple-50 text-purple-700",
  },
  target_weight: {
    icon: icons.goals.weight,
    accent: "border-l-[#f0bd78]",
    iconClass: "bg-orange-50 text-orange-600",
  },
};

const activeGoals = computed(() => goalStore.goals.filter((goal) => goal.status === "active"));
const historicalGoals = computed(() =>
  goalStore.goals
    .filter((goal) => ["completed", "cancelled"].includes(goal.status))
    .sort((first, second) => normalizeDate(second.end_date).localeCompare(normalizeDate(first.end_date))),
);

const historyColumns = [
  { key: "goal_type", label: "Objetivo" },
  { key: "target_value", label: "Meta" },
  { key: "status", label: "Estado" },
  { key: "end_date", label: "Fecha final" },
];

const normalizeDate = (date) => String(date).slice(0, 10);
const formatDate = (date) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${normalizeDate(date)}T00:00:00`))
    .replace(" de ", " ");

const startEditing = async (goal) => {
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

  useMacroDistribution.value = false;
  editingHadDistribution.value = false;
  macroDistribution.value = {
    carbs_percentage: 50,
    protein_percentage: 20,
    fat_percentage: 30,
  };

  if (goal.goal_type === "daily_calories") {
    try {
      const distribution = await goalStore.loadNutritionDistribution(goal.id);
      if (distribution) {
        macroDistribution.value = {
          carbs_percentage: Number(distribution.carbs_percentage),
          protein_percentage: Number(distribution.protein_percentage),
          fat_percentage: Number(distribution.fat_percentage),
        };
        useMacroDistribution.value = true;
        editingHadDistribution.value = true;
      }
    } catch (error) {
      toastStore.notify(error.message, "error");
    }
  }
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

  const distributionTotal = Object.values(macroDistribution.value).reduce(
    (sum, percentage) => sum + Number(percentage || 0),
    0,
  );
  if (
    editForm.goal_type === "daily_calories" &&
    useMacroDistribution.value &&
    Math.abs(distributionTotal - 100) > 0.001
  ) {
    toastStore.notify("La distribución de macronutrientes debe sumar 100%", "error");
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
    if (editForm.goal_type === "daily_calories" && useMacroDistribution.value) {
      await goalStore.saveNutritionDistribution(goalId, macroDistribution.value);
    } else if (editingHadDistribution.value) {
      await goalStore.deleteNutritionDistribution(goalId);
    }
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
  <div class="mb-4 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <span class="grid size-12 place-items-center rounded-full bg-[#fceee8] text-[#8d5d50]"
        ><component :is="icons.goals.target" class="size-6"
      /></span>
      <div>
        <h2 class="text-2xl font-extrabold">Mis objetivos</h2>
        <p class="mt-1 text-sm text-[#573e33]/60">
          Consulta tus metas activas, complétalas o crea otras nuevas.
        </p>
      </div>
    </div>
    <button
      v-if="goalStore.goals.some((goal) => goal.status !== 'active')"
      type="button"
      class="shrink-0 text-sm font-bold hover:text-[#a46f62]"
      @click="showHistory = !showHistory"
    >
      {{ showHistory ? "Ver activos" : "Ver historial" }} ›
    </button>
  </div>

  <LoadingState v-if="goalStore.isLoading && !goalStore.goals.length" />
  <DataTable
    v-else-if="showHistory && historicalGoals.length"
    :columns="historyColumns"
    :rows="historicalGoals"
    :max-rows="3"
    min-width="680px"
  >
    <template #cell-goal_type="{ row }">
      <div class="flex items-center gap-3 font-bold">
        <span
          class="grid size-9 shrink-0 place-items-center rounded-lg"
          :class="goalStyles[row.goal_type]?.iconClass"
        >
          <component
            :is="goalStyles[row.goal_type]?.icon ?? icons.goals.target"
            class="size-5"
            aria-hidden="true"
          />
        </span>
        {{ goalLabels[row.goal_type] ?? row.goal_type }}
      </div>
    </template>

    <template #cell-target_value="{ row }">
      <strong>
        {{ Number(row.target_value).toFixed(2) }} {{ unitLabels[row.goal_type] ?? "" }}
      </strong>
    </template>

    <template #cell-status="{ row }">
      <span
        class="inline-flex rounded-full px-3 py-1 text-xs font-extrabold"
        :class="
          row.status === 'completed'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-stone-100 text-stone-600'
        "
      >
        {{ statusLabels[row.status] ?? row.status }}
      </span>
    </template>

    <template #cell-end_date="{ value }">
      <span class="inline-flex items-center gap-2 whitespace-nowrap">
        <component :is="icons.common.date" class="size-4" aria-hidden="true" />
        {{ formatDate(value) }}
      </span>
    </template>
  </DataTable>

  <div
    v-else-if="!showHistory && activeGoals.length"
    class="grid gap-4 max-[760px]:grid-cols-1"
    :class="
      activeGoals.length === 3
        ? 'grid-cols-3 max-[1200px]:grid-cols-2'
        : activeGoals.length >= 2
          ? 'grid-cols-2'
          : 'grid-cols-1'
    "
  >
    <BaseCard
      v-for="goal in activeGoals"
      :key="goal.id"
      class="border-l-2 `p-4!`"
      :class="goalStyles[goal.goal_type]?.accent"
    >
      <div class="flex gap-4">
        <span
          class="grid size-12 shrink-0 place-items-center rounded-xl"
          :class="goalStyles[goal.goal_type]?.iconClass"
          ><component :is="goalStyles[goal.goal_type]?.icon ?? icons.goals.target" class="size-6"
        /></span>
        <div class="min-w-0 flex-1">
          <span
            class="inline-flex rounded-full px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide"
            :class="
              goal.status === 'active'
                ? 'bg-emerald-50 text-emerald-700'
                : goal.status === 'completed'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-stone-100 text-stone-600'
            "
            >{{ statusLabels[goal.status] ?? goal.status }}</span
          >
          <h3 class="mt-1.5 font-bold">{{ goalLabels[goal.goal_type] ?? goal.goal_type }}</h3>
          <strong class="mt-0.5 block text-lg"
            >{{ Number(goal.target_value).toFixed(2) }}
            {{ unitLabels[goal.goal_type] ?? "" }}</strong
          >
          <p class="mt-1.5 flex items-center gap-2 text-xs text-[#573e33]/55">
            <component :is="icons.common.date" class="size-4" />{{ formatDate(goal.start_date) }}
            <span>—</span> {{ formatDate(goal.end_date) }}
          </p>
        </div>
      </div>
      <div class="mt-3 grid grid-cols-3 gap-2 max-[480px]:grid-cols-1">
        <button
          type="button"
          class="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#b98a81]/30 text-xs font-bold hover:bg-[#f7f1ec]"
          @click="startEditing(goal)"
        >
          <component :is="icons.actions.edit" class="size-4" />Editar
        </button>
        <button
          v-if="goal.status === 'active'"
          type="button"
          class="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#b98a81]/30 text-xs font-bold hover:bg-emerald-50"
          @click="completeGoal(goal)"
        >
          <component :is="icons.actions.complete" class="size-4" />Completar
        </button>
        <button
          type="button"
          class="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
          @click="pendingDeleteId = goal.id"
        >
          <component :is="icons.actions.delete" class="size-4" />Eliminar
        </button>
      </div>
    </BaseCard>
  </div>
  <EmptyState
    v-else
    :title="
      showHistory ? 'No hay objetivos en el historial' : 'Todavía no tienes objetivos activos'
    "
    description="Crea un objetivo para personalizar tu seguimiento."
  />

  <Modal
    :open="Boolean(editingGoalId)"
    title="Editar objetivo"
    :loading="goalStore.isLoading"
    @update:open="cancelEditing"
  >
    <form
      class="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1"
      @submit.prevent="saveGoal(editingGoalId)"
    >
      <label class="grid gap-2 text-sm font-semibold"
        >Tipo de objetivo<select
          v-model="editForm.goal_type"
          class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3"
        >
          <option v-for="(label, type) in goalLabels" :key="type" :value="type">{{ label }}</option>
        </select></label
      >
      <label class="grid gap-2 text-sm font-semibold"
        >Valor objetivo<input
          v-model="editForm.target_value"
          type="number"
          min="0.1"
          step="0.1"
          required
          class="h-11 rounded-lg border border-[#b98a81]/35 px-3"
      /></label>
      <label class="grid gap-2 text-sm font-semibold"
        >Fecha de inicio<input
          v-model="editForm.start_date"
          type="date"
          required
          class="h-11 rounded-lg border border-[#b98a81]/35 px-3"
      /></label>
      <label class="grid gap-2 text-sm font-semibold"
        >Fecha final<input
          v-model="editForm.end_date"
          type="date"
          :min="editForm.start_date"
          required
          class="h-11 rounded-lg border border-[#b98a81]/35 px-3"
      /></label>
      <label class="grid gap-2 text-sm font-semibold"
        >Estado<select
          v-model="editForm.status"
          class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3"
        >
          <option v-for="(label, status) in statusLabels" :key="status" :value="status">
            {{ label }}
          </option>
        </select></label
      >
      <div
        v-if="editForm.goal_type === 'daily_calories'"
        class="col-span-2 grid gap-3 max-[640px]:col-span-1"
      >
        <label class="flex cursor-pointer items-center gap-3 text-sm font-bold">
          <input v-model="useMacroDistribution" type="checkbox" class="size-4 accent-[#573e33]" />
          Distribuir el objetivo calórico entre macronutrientes
        </label>
        <MacroDistributionFields
          v-if="useMacroDistribution"
          v-model="macroDistribution"
          :calories="editForm.target_value"
        />
      </div>
      <div class="col-span-2 flex justify-end gap-3 max-[640px]:col-span-1">
        <button
          type="button"
          class="h-11 rounded-lg border border-[#b98a81]/35 px-5 font-bold"
          @click="cancelEditing"
        >
          Cancelar</button
        ><button type="submit" class="h-11 rounded-lg bg-[#573e33] px-5 font-bold text-white">
          {{ goalStore.isLoading ? "Guardando..." : "Guardar cambios" }}
        </button>
      </div>
    </form>
  </Modal>

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
