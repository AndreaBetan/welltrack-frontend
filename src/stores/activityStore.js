import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiRequest } from "@/services/apiService";
import { toLocalDateValue } from "@/utils/dateUtils";

// Se construye la fecha local para evitar que UTC cambie el día del registro.
const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useActivityStore = defineStore("activity", () => {
  const entries = ref([]);
  const activityTypes = ref([]);
  const isFetching = ref(false);
  const isCreating = ref(false);
  const updatingId = ref(null);
  const isTypesLoading = ref(false);
  const isLoading = computed(
    () => isFetching.value || isCreating.value || Boolean(updatingId.value),
  );

  const todayEntries = computed(() =>
    entries.value.filter((entry) => toLocalDateValue(entry.log_date) === today()),
  );
  const minutesToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.duration_minutes), 0),
  );
  const caloriesBurnedToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.calories_burned || 0), 0),
  );

  const loadEntries = async (filters = {}) => {
    isFetching.value = true;

    try {
      const params = new URLSearchParams();

      if (filters.date) {
        params.set("date", filters.date);
      }

      const query = params.toString();

      entries.value = await apiRequest(`/activities${query ? `?${query}` : ""}`);

      return entries.value;
    } finally {
      isFetching.value = false;
    }
  };

  const loadActivityTypes = async (force = false) => {
    if (activityTypes.value.length && !force) return activityTypes.value;

    isTypesLoading.value = true;

    try {
      activityTypes.value = await apiRequest("/activities/types");
      return activityTypes.value;
    } finally {
      isTypesLoading.value = false;
    }
  };

  const addEntry = async (activityData) => {
    isCreating.value = true;

    try {
      const entry = await apiRequest("/activities", {
        method: "POST",
        body: JSON.stringify(activityData),
      });

      // Crear una nueva referencia actualiza inmediatamente todos los computed
      // que alimentan el historial y el resumen semanal.
      entries.value = [entry, ...entries.value];
      return entry;
    } finally {
      isCreating.value = false;
    }
  };

  const updateEntry = async (entryId, activityData) => {
    updatingId.value = entryId;

    try {
      const updatedEntry = await apiRequest(`/activities/${entryId}`, {
        method: "PATCH",
        body: JSON.stringify(activityData),
      });

      entries.value = entries.value.map((entry) => (entry.id === entryId ? updatedEntry : entry));

      return updatedEntry;
    } finally {
      updatingId.value = null;
    }
  };

  const deleteEntry = async (entryId) => {
    await apiRequest(`/activities/${entryId}`, {
      method: "DELETE",
    });

    entries.value = entries.value.filter((entry) => entry.id !== entryId);
  };

  const clearEntries = () => {
    entries.value = [];
    activityTypes.value = [];
  };

  return {
    entries,
    activityTypes,
    todayEntries,
    isLoading,
    isFetching,
    isCreating,
    updatingId,
    isTypesLoading,
    minutesToday,
    caloriesBurnedToday,
    loadEntries,
    loadActivityTypes,
    addEntry,
    updateEntry,
    deleteEntry,
    clearEntries,
  };
});
