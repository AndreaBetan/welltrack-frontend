<script setup>
import { DatePicker, FormField } from "@/components/forms";
import { toLocalDateValue } from "@/utils/dateUtils";
import { computed, reactive, ref } from "vue";
import MacroDistributionFields from "@/components/goals/MacroDistributionFields.vue";
import { icons } from "@/icons";
import { useGoalStore } from "@/stores/goalStore";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({
  onboarding: { type: Boolean, default: false },
});

const emit = defineEmits(["completed"]);
const goalStore = useGoalStore();
const toastStore = useToastStore();
const macroDistribution = ref({
  carbs_percentage: 50,
  protein_percentage: 20,
  fat_percentage: 30,
});

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
    icon: icons.goals.activity,
    iconClass: "bg-emerald-50 text-emerald-700",
    selected: false,
  },
  {
    type: "nightly_sleep_hours",
    title: "Mejorar mi descanso",
    description: "Horas que quieres dormir cada noche.",
    unit: "horas",
    value: 8,
    icon: icons.goals.sleep,
    iconClass: "bg-purple-50 text-purple-700",
    selected: false,
  },
  {
    type: "daily_calories",
    title: "Cuidar mi alimentación",
    description: "Referencia personal de consumo energético diario.",
    unit: "kcal",
    value: 2000,
    icon: icons.goals.nutrition,
    iconClass: "bg-[#fce9e4] text-[#b56f61]",
    selected: false,
  },
  {
    type: "target_weight",
    title: "Alcanzar un peso objetivo",
    description: "Peso que quieres alcanzar durante este periodo.",
    unit: "kg",
    value: 65,
    icon: icons.goals.weight,
    iconClass: "bg-orange-50 text-orange-600",
    selected: false,
  },
]);

const dates = reactive({
  startDate: toLocalDateValue(startDate),
  endDate: toLocalDateValue(defaultEndDate),
});

const activeGoalTypes = computed(
  () =>
    new Set(
      goalStore.goals.filter((goal) => goal.status === "active").map((goal) => goal.goal_type),
    ),
);

// En Perfil solo ofrecemos tipos que todavía no tengan una meta activa.
const availableOptions = computed(() =>
  options.filter((option) => !activeGoalTypes.value.has(option.type)),
);

const selectedOptions = computed(() => availableOptions.value.filter((option) => option.selected));
const selectedCalorieOption = computed(() =>
  selectedOptions.value.find((option) => option.type === "daily_calories"),
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

  const distributionTotal = Object.values(macroDistribution.value).reduce(
    (sum, percentage) => sum + Number(percentage || 0),
    0,
  );
  if (selectedCalorieOption.value && Math.abs(distributionTotal - 100) > 0.001) {
    toastStore.notify("La distribución de macronutrientes debe sumar 100%", "error");
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
    const createdGoals = await goalStore.createGoals(payload);
    const calorieGoal = createdGoals.find((goal) => goal.goal_type === "daily_calories");
    if (calorieGoal) {
      await goalStore.saveNutritionDistribution(calorieGoal.id, macroDistribution.value);
    }
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
  <section
    class="rounded-2xl border border-dashed border-[#d9a99e]/60 bg-[#fffaf7] p-6 max-[520px]:p-4"
  >
    <form
      class="grid gap-5 min-[1100px]:grid-cols-[260px_minmax(0,1fr)] min-[1100px]:items-start"
      @submit.prevent="handleSubmit"
    >
      <div class="min-[1100px]:pt-1">
        <h2 class="text-2xl font-extrabold">Crear nuevo objetivo</h2>
        <p class="mt-3 text-sm text-[#573e33]/60">
          Elige un tipo de objetivo y define tu meta para mantener el foco.
        </p>
        <button
          v-if="availableOptions.length"
          type="submit"
          :disabled="goalStore.isLoading || !selectedOptions.length"
          class="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <component :is="icons.actions.add" class="size-4" />
          {{
            goalStore.isLoading
              ? "Guardando..."
              : props.onboarding
                ? "Guardar y continuar"
                : "Crear objetivo"
          }}
        </button>
      </div>
      <div
        v-if="availableOptions.length"
        class="flex flex-wrap gap-3 min-[1100px]:flex-nowrap min-[1100px]:justify-end"
      >
        <article
          v-for="option in availableOptions"
          :key="option.type"
          role="checkbox"
          tabindex="0"
          :aria-checked="option.selected"
          class="min-w-0 flex-1 basis-40 cursor-pointer rounded-xl border-2 bg-white p-4 text-center transition shadow-[0_8px_24px_rgba(87,62,51,0.04)] min-[1100px]:max-w-52 max-[620px]:basis-full"
          :class="
            option.selected
              ? 'border-[#573e33] bg-[#f7f1ec]'
              : 'border-[#b98a81]/25 bg-white hover:border-[#b98a81]'
          "
          @click="toggleOption(option)"
          @keydown.enter.prevent="toggleOption(option)"
          @keydown.space.prevent="toggleOption(option)"
        >
          <div class="grid justify-items-center gap-2">
            <span class="grid size-11 place-items-center rounded-full" :class="option.iconClass"
              ><component :is="option.icon" class="size-5"
            /></span>
            <div class="min-w-0 w-full">
              <h3 class="font-bold">{{ option.title }}</h3>
              <p
                v-if="!(option.type === 'daily_calories' && option.selected)"
                class="mt-1.5 text-xs leading-5 text-[#573e33]/65"
              >
                {{ option.description }}
              </p>

              <div v-if="option.selected" class="mt-4 text-left" @click.stop @keydown.stop>
                <FormField
                  :id="`goal-${option.type}-value`"
                  v-model="option.value"
                  :label="`Mi objetivo (${option.unit})`"
                  type="number"
                  min="0.1"
                  step="0.1"
                />
              </div>

              <MacroDistributionFields
                v-if="option.type === 'daily_calories' && option.selected"
                v-model="macroDistribution"
                :calories="option.value"
                compact
                class="mt-4"
                @click.stop
              />
            </div>
          </div>
        </article>
      </div>

      <p v-else class="text-sm text-[#573e33]/65 min-[1100px]:col-start-2">
        Ya tienes un objetivo activo de cada categoría disponible.
      </p>

      <div
        v-if="selectedOptions.length"
        class="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1 min-[1100px]:col-start-2"
      >
        <DatePicker
          id="goal-start-date"
          v-model="dates.startDate"
          label="Fecha de inicio"
          required
        />
        <DatePicker
          id="goal-end-date"
          v-model="dates.endDate"
          label="Fecha de finalización"
          :min="dates.startDate"
          required
        />
      </div>
    </form>
  </section>
</template>
