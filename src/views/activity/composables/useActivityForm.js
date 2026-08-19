import { computed, ref, toValue, watch } from "vue";
import { toLocalDateValue, todayLocalDate } from "@/utils/dateUtils";

// Centraliza el estado y las reglas compartidas por los formularios de creación
// y edición. La vista solo decide cuándo guardar los datos en el store.
export const useActivityForm = ({ weight, getActivity }) => {
  const editingId = ref(null);

  const createEmptyForm = () => ({
    activity_type: "",
    duration_minutes: "",
    calories_burned: "",
    log_date: todayLocalDate(),
    intensity: "",
    notes: "",
  });

  const form = ref(createEmptyForm());
  const editForm = ref(createEmptyForm());
  const isEditing = computed(() => Boolean(editingId.value));
  const activeForm = computed(() => (isEditing.value ? editForm.value : form.value));

  const estimatedCalories = computed(() => {
    const activity = getActivity(activeForm.value.activity_type);
    const currentWeight = Number(toValue(weight));
    const duration = Number(activeForm.value.duration_minutes);

    if (!activity || !currentWeight || !duration) return null;
    return Math.round(((activity.met * 3.5 * currentWeight) / 200) * duration);
  });

  // La estimación propone un valor tanto al crear como al editar. El campo
  // permanece habilitado para que el usuario pueda ajustarlo manualmente.
  watch(
    estimatedCalories,
    (calories) => {
      if (calories === null) return;
      const target = isEditing.value ? editForm : form;
      target.value = { ...target.value, calories_burned: calories };
    },
    { flush: "sync" },
  );

  const resetCreateForm = () => {
    form.value = createEmptyForm();
  };

  const startEditing = (entry) => {
    editingId.value = entry.id;
    editForm.value = {
      activity_type: entry.activity_type,
      duration_minutes: Number(entry.duration_minutes),
      calories_burned: Number(entry.calories_burned),
      log_date: toLocalDateValue(entry.log_date),
      intensity: entry.intensity ?? "",
      notes: entry.notes ?? "",
    };
  };

  const cancelEditing = () => {
    editingId.value = null;
    editForm.value = createEmptyForm();
  };

  const toPayload = (formData) => ({
    activity_type: formData.activity_type,
    duration_minutes: Number(formData.duration_minutes),
    calories_burned: Number(formData.calories_burned),
    log_date: formData.log_date,
    intensity: (getActivity(formData.activity_type)?.intensity ?? formData.intensity) || null,
    notes: formData.notes.trim() || null,
  });

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
