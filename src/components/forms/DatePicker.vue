<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { icons } from "@/icons";

defineOptions({ name: "FormDatePicker" });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Selecciona una fecha" },
  min: { type: String, default: null },
  max: { type: String, default: null },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const model = defineModel({ type: String, default: "" });
const root = ref(null);
const trigger = ref(null);
const calendar = ref(null);
const isOpen = ref(false);
const calendarPosition = ref({ top: "0px", left: "0px", width: "19rem" });

const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const selectedDate = computed(() => parseDate(model.value));
const visibleMonth = ref(selectedDate.value ?? new Date());
const todayValue = toDateValue(new Date());

const formattedDate = computed(() => {
  if (!selectedDate.value) return props.placeholder;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(selectedDate.value);
});

const monthLabel = computed(() => {
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth.value);
  return label.charAt(0).toUpperCase() + label.slice(1);
});

const calendarDays = computed(() => {
  const year = visibleMonth.value.getFullYear();
  const month = visibleMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysBeforeMonday = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(year, month, 1 - daysBeforeMonday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const value = toDateValue(date);

    return {
      date,
      value,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: value === todayValue,
      isSelected: value === model.value,
      isDisabled: Boolean((props.min && value < props.min) || (props.max && value > props.max)),
    };
  });
});

const updateCalendarPosition = async () => {
  if (!isOpen.value || !trigger.value) return;

  const rect = trigger.value.getBoundingClientRect();
  const viewportPadding = 16;
  const gap = 8;
  const width = Math.min(304, window.innerWidth - viewportPadding * 2);
  const left = Math.min(
    Math.max(rect.right - width, viewportPadding),
    window.innerWidth - width - viewportPadding,
  );

  calendarPosition.value = {
    top: `${rect.bottom + gap}px`,
    left: `${left}px`,
    width: `${width}px`,
  };

  await nextTick();
  const height = calendar.value?.offsetHeight || 390;
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
  const spaceAbove = rect.top - viewportPadding;

  if (height > spaceBelow && spaceAbove > spaceBelow) {
    calendarPosition.value = {
      ...calendarPosition.value,
      top: `${Math.max(viewportPadding, rect.top - height - gap)}px`,
    };
  }
};

const toggle = async () => {
  if (props.disabled) return;
  if (!isOpen.value) visibleMonth.value = selectedDate.value ?? new Date();
  isOpen.value = !isOpen.value;
  if (isOpen.value) await updateCalendarPosition();
};

const changeMonth = (amount) => {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth() + amount,
    1,
  );
};

const selectDate = (day) => {
  if (day.isDisabled) return;
  model.value = day.value;
  isOpen.value = false;
};

const selectToday = () => {
  const today = calendarDays.value.find((day) => day.value === todayValue);
  if (today) selectDate(today);
  else if ((!props.min || todayValue >= props.min) && (!props.max || todayValue <= props.max)) {
    model.value = todayValue;
    isOpen.value = false;
  }
};

const handleOutsideClick = (event) => {
  if (!root.value?.contains(event.target) && !calendar.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

const handleEscape = (event) => {
  if (event.key === "Escape") isOpen.value = false;
};

watch(model, (value) => {
  if (value) visibleMonth.value = parseDate(value);
});

onMounted(() => {
  document.addEventListener("pointerdown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", updateCalendarPosition);
  window.addEventListener("scroll", updateCalendarPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleOutsideClick);
  document.removeEventListener("keydown", handleEscape);
  window.removeEventListener("resize", updateCalendarPosition);
  window.removeEventListener("scroll", updateCalendarPosition, true);
});
</script>

<template>
  <div ref="root" class="grid min-w-0 content-start gap-2 text-sm font-semibold text-[#573e33]/75">
    <label v-if="label" :for="id">{{ label }}</label>

    <div class="relative min-w-0">
      <button
        ref="trigger"
        :id="id"
        type="button"
        :disabled="disabled"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        class="flex h-11 w-full min-w-0 items-center gap-3 rounded-lg border border-[#b98a81]/35 bg-white px-3 text-left text-[#573e33] outline-none transition hover:border-[#b98a81]/60 focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15 disabled:cursor-not-allowed disabled:opacity-50"
        @click="toggle"
      >
        <span class="min-w-0 flex-1 truncate" :class="model ? '' : 'text-[#573e33]/45'">
          {{ formattedDate }}
        </span>
        <component :is="icons.common.date" aria-hidden="true" class="size-4 shrink-0" />
      </button>

      <input
        v-if="required"
        v-model="model"
        aria-hidden="true"
        class="pointer-events-none absolute bottom-0 left-1/2 size-px opacity-0"
        tabindex="-1"
        required
      />

      <Teleport to="body">
        <section
          v-if="isOpen"
          ref="calendar"
          class="fixed z-[100] rounded-2xl border border-[#b98a81]/25 bg-white p-4 text-[#573e33] shadow-[0_18px_45px_rgba(87,62,51,0.16)]"
          :style="calendarPosition"
          role="dialog"
          aria-label="Seleccionar fecha"
        >
        <header class="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Mes anterior"
            class="grid size-9 place-items-center rounded-lg transition hover:bg-[#f7f1ec]"
            @click="changeMonth(-1)"
          >
            <component :is="icons.actions.previous" aria-hidden="true" class="size-4" />
          </button>
          <strong class="text-sm capitalize">{{ monthLabel }}</strong>
          <button
            type="button"
            aria-label="Mes siguiente"
            class="grid size-9 place-items-center rounded-lg transition hover:bg-[#f7f1ec]"
            @click="changeMonth(1)"
          >
            <component :is="icons.actions.next" aria-hidden="true" class="size-4" />
          </button>
        </header>

        <div class="mb-1 grid grid-cols-7 text-center text-[0.68rem] font-bold uppercase text-[#573e33]/45">
          <span v-for="weekday in ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']" :key="weekday">
            {{ weekday }}
          </span>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in calendarDays"
            :key="day.value"
            type="button"
            :disabled="day.isDisabled"
            class="relative grid aspect-square place-items-center rounded-lg text-xs transition"
            :class="[
              day.isSelected
                ? 'bg-[#573e33] font-bold text-white shadow-sm'
                : 'hover:bg-[#f7f1ec]',
              !day.isCurrentMonth && !day.isSelected ? 'text-[#573e33]/30' : '',
              day.isToday && !day.isSelected ? 'font-extrabold text-[#c98274]' : '',
              day.isDisabled ? 'cursor-not-allowed opacity-25 hover:bg-transparent' : '',
            ]"
            @click="selectDate(day)"
          >
            {{ day.day }}
            <span
              v-if="day.isToday && !day.isSelected"
              class="absolute bottom-1 size-1 rounded-full bg-[#c98274]"
            />
          </button>
        </div>

        <footer class="mt-3 border-t border-[#b98a81]/15 pt-3 text-center">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-xs font-bold text-[#a46f62] transition hover:bg-[#f7f1ec]"
            @click="selectToday"
          >
            Ir a hoy
          </button>
        </footer>
        </section>
      </Teleport>
    </div>
  </div>
</template>
