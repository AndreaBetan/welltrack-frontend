import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useSleepStore = defineStore("sleep", () => {
  const entries = ref([]);
  const factors = ref([]);
  const isFetching = ref(false);
  const isCreating = ref(false);
  const updatingId = ref(null);
  const isFactorsLoading = ref(false);
  const isLoading = computed(
    () => isFetching.value || isCreating.value || Boolean(updatingId.value),
  );

  const lastEntry = computed(() => entries.value[0] ?? null);
  const lastSleepHours = computed(() =>
    lastEntry.value ? Math.round((Number(lastEntry.value.duration_minutes) / 60) * 10) / 10 : 0,
  );
  const averageQuality = computed(() => {
    if (!entries.value.length) return 0;
    const total = entries.value.reduce((sum, entry) => sum + Number(entry.sleep_quality), 0);
    return Math.round((total / entries.value.length) * 10) / 10;
  });

  const loadEntries = async (filters = {}) => {
    isFetching.value = true;
    try {
      const params = new URLSearchParams();
      if (filters.date) params.set("date", filters.date);
      const query = params.toString();
      entries.value = await apiRequest(`/sleep${query ? `?${query}` : ""}`);
      return entries.value;
    } finally {
      isFetching.value = false;
    }
  };

  const loadFactors = async (force = false) => {
    if (factors.value.length && !force) return factors.value;
    isFactorsLoading.value = true;
    try {
      factors.value = await apiRequest("/sleep/factors");
      return factors.value;
    } finally {
      isFactorsLoading.value = false;
    }
  };

  const addEntry = async (sleepData) => {
    isCreating.value = true;
    try {
      const entry = await apiRequest("/sleep", {
        method: "POST",
        body: JSON.stringify(sleepData),
      });
      entries.value = [entry, ...entries.value];
      return entry;
    } finally {
      isCreating.value = false;
    }
  };

  const updateEntry = async (entryId, sleepData) => {
    updatingId.value = entryId;
    try {
      const entry = await apiRequest(`/sleep/${entryId}`, {
        method: "PATCH",
        body: JSON.stringify(sleepData),
      });
      entries.value = entries.value.map((current) => (current.id === entryId ? entry : current));
      return entry;
    } finally {
      updatingId.value = null;
    }
  };

  const deleteEntry = async (entryId) => {
    await apiRequest(`/sleep/${entryId}`, { method: "DELETE" });
    entries.value = entries.value.filter((entry) => entry.id !== entryId);
  };

  const clearEntries = () => {
    entries.value = [];
    factors.value = [];
  };

  return {
    entries,
    factors,
    isLoading,
    isFetching,
    isCreating,
    updatingId,
    isFactorsLoading,
    lastEntry,
    lastSleepHours,
    averageQuality,
    loadEntries,
    loadFactors,
    addEntry,
    updateEntry,
    deleteEntry,
    clearEntries,
  };
});
