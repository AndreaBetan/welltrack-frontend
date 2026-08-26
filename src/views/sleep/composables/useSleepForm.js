import { computed, ref } from "vue";
import { todayLocalDate, toLocalDateValue } from "@/utils/dateUtils";

const toLocalTimeValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const useSleepForm = () => {
  const editingId = ref(null);

  const createEmptyForm = () => ({
    log_date: todayLocalDate(),
    start_time: "",
    end_time: "",
    sleep_quality: "",
    sleep_latency_minutes: 0,
    awakenings_count: 0,
    sleep_type: "night",
    factors: [],
  });

  const form = ref(createEmptyForm());
  const editForm = ref(createEmptyForm());
  const isEditing = computed(() => Boolean(editingId.value));

  const resetCreateForm = () => {
    form.value = createEmptyForm();
  };

  const startEditing = (entry) => {
    editingId.value = entry.id;
    editForm.value = {
      log_date: toLocalDateValue(entry.log_date),
      start_time: toLocalTimeValue(entry.started_at),
      end_time: toLocalTimeValue(entry.ended_at),
      sleep_quality: Number(entry.sleep_quality),
      sleep_latency_minutes: Number(entry.sleep_latency_minutes),
      awakenings_count: Number(entry.awakenings_count),
      sleep_type: entry.sleep_type,
      factors: entry.factors.map((factor) => factor.code),
    };
  };

  const cancelEditing = () => {
    editingId.value = null;
    editForm.value = createEmptyForm();
  };

  // log_date es el día de despertar. Si el inicio es posterior al final,
  // la sesión comenzó durante el día anterior.
  const toPayload = (data) => {
    const end = new Date(`${data.log_date}T${data.end_time}:00`);
    const start = new Date(`${data.log_date}T${data.start_time}:00`);
    if (start >= end) start.setDate(start.getDate() - 1);

    if (end > new Date()) throw new Error("La hora final no puede estar en el futuro");

    return {
      started_at: start.toISOString(),
      ended_at: end.toISOString(),
      sleep_quality: Number(data.sleep_quality),
      sleep_latency_minutes: Number(data.sleep_latency_minutes || 0),
      awakenings_count: Number(data.awakenings_count || 0),
      sleep_type: data.sleep_type,
      factors: [...data.factors],
      log_date: data.log_date,
    };
  };

  return {
    form,
    editForm,
    editingId,
    isEditing,
    resetCreateForm,
    startEditing,
    cancelEditing,
    toPayload,
  };
};
