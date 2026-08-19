<script setup>
import { computed, reactive } from "vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import { useGoalStore } from "@/stores/goalStore";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({
  onboarding: { type: Boolean, default: false },
});

const emit = defineEmits(["completed"]);
const goalStore = useGoalStore();
const toastStore = useToastStore();

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startDate = new Date();
const defaultEndDate = new Date();
defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);

// Estas opciones representan los goal_type aceptados por la API. El texto de
// presentación puede cambiar sin alterar los valores enviados al backend.
const options = reactive([
  {
    type: "daily_activity_minutes",
    title: "Moverme más",
    description: "Minutos de actividad física que quieres completar cada día.",
    unit: "minutos",
    value: 30,
    selected: false,
  },
  {
    type: "nightly_sleep_hours",
    title: "Mejorar mi descanso",
    description: "Horas que quieres dormir cada noche.",
    unit: "horas",
    value: 8,
    selected: false,
  },
  {
    type: "daily_calories",
    title: "Cuidar mi alimentación",
    description: "Referencia personal de consumo energético diario.",
    unit: "kcal",
    value: 2000,
    selected: false,
  },
  {
    type: "target_weight",
    title: "Alcanzar un peso objetivo",
    description: "Peso que quieres alcanzar durante este periodo.",
    unit: "kg",
    value: 65,
    selected: false,
  },
]);

const dates = reactive({
  startDate: formatLocalDate(startDate),
  endDate: formatLocalDate(defaultEndDate),
});

const activeGoalTypes = computed(
  () =>
    new Set(
      goalStore.goals
        .filter((goal) => goal.status === "active")
        .map((goal) => goal.goal_type),
    ),
);

// En Perfil solo ofrecemos tipos que todavía no tengan una meta activa.
const availableOptions = computed(() =>
  options.filter((option) => !activeGoalTypes.value.has(option.type)),
);

const selectedOptions = computed(() =>
  availableOptions.value.filter((option) => option.selected),
);

const toggleOption = (option) => {
  option.selected = !option.selected;
};

const handleSubmit = async () => {
  if (!selectedOptions.value.length) {
    toastStore.notify("Selecciona al menos un objetivo", "error");
    return;
  }

  if (dates.endDate < dates.startDate) {
    toastStore.notify("La fecha final no puede ser anterior a la inicial", "error");
    return;
  }

  const payload = selectedOptions.value.map((option) => ({
    goal_type: option.type,
    target_value: Number(option.value),
    start_date: dates.startDate,
    end_date: dates.endDate,
    status: "active",
  }));

  try {
    await goalStore.createGoals(payload);
    options.forEach((option) => {
      option.selected = false;
    });
    toastStore.notify("Objetivos guardados correctamente");
    emit("completed");
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};
</script>

<template>
  <BaseCard>
    <form class="grid gap-6" @submit.prevent="handleSubmit">
      <div
        v-if="availableOptions.length"
        class="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1"
      >
        <article
          v-for="option in availableOptions"
          :key="option.type"
          role="checkbox"
          tabindex="0"
          :aria-checked="option.selected"
          class="cursor-pointer rounded-xl border-2 p-5 transition max-[420px]:p-4"
          :class="
            option.selected
              ? 'border-[#573e33] bg-[#f7f1ec]'
              : 'border-[#b98a81]/25 bg-white hover:border-[#b98a81]'
          "
          @click="toggleOption(option)"
          @keydown.enter.prevent="toggleOption(option)"
          @keydown.space.prevent="toggleOption(option)"
        >
          <div class="flex items-start gap-3">
            <input
              v-model="option.selected"
              type="checkbox"
              class="mt-1 accent-[#573e33]"
              @click.stop
            />

            <div class="min-w-0 flex-1">
              <h3 class="text-xl font-bold">{{ option.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-[#573e33]/65">
                {{ option.description }}
              </p>

              <label
                v-if="option.selected"
                class="mt-4 grid gap-2 text-sm font-semibold"
                @click.stop
              >
                Mi objetivo
                <div class="flex items-center gap-2 max-[420px]:items-end">
                  <input
                    v-model="option.value"
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    class="h-11 min-w-0 flex-1 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
                    @click.stop
                  />
                  <span class="shrink-0 pb-3">{{ option.unit }}</span>
                </div>
              </label>
            </div>
          </div>
        </article>
      </div>

      <p v-else class="text-sm text-[#573e33]/65">
        Ya tienes un objetivo activo de cada categoría disponible.
      </p>

      <div v-if="availableOptions.length" class="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
        <label class="grid gap-2 text-sm font-semibold">
          Fecha de inicio
          <input
            v-model="dates.startDate"
            type="date"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>

        <label class="grid gap-2 text-sm font-semibold">
          Fecha de finalización
          <input
            v-model="dates.endDate"
            type="date"
            :min="dates.startDate"
            required
            class="h-11 rounded-lg border border-[#b98a81]/35 bg-white px-3 outline-none focus:border-[#573e33]"
          />
        </label>
      </div>

      <button
        v-if="availableOptions.length"
        type="submit"
        :disabled="goalStore.isLoading || !selectedOptions.length"
        class="h-12 rounded-lg bg-[#573e33] px-6 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{
          goalStore.isLoading
            ? "Guardando..."
            : props.onboarding
              ? "Guardar y continuar"
              : "Guardar objetivos"
        }}
      </button>
    </form>
  </BaseCard>
</template>
