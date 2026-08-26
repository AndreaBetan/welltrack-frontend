import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

const localDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useNutritionStore = defineStore("nutrition", () => {
  const entries = ref([]);
  const isLoading = ref(false);

  const todayEntries = computed(() =>
    entries.value.filter((entry) => String(entry.log_date).slice(0, 10) === localDate()),
  );

  const sumToday = (field) =>
    todayEntries.value.reduce((total, entry) => total + Number(entry[field] || 0), 0);

  const totalCaloriesToday = computed(() => Math.round(sumToday("calories") * 10) / 10);
  const totalProteinToday = computed(() => Math.round(sumToday("protein") * 10) / 10);
  const totalCarbsToday = computed(() => Math.round(sumToday("carbs") * 10) / 10);
  const totalFatToday = computed(() => Math.round(sumToday("fat") * 10) / 10);

  const loadEntries = async (filters = {}) => {
    isLoading.value = true;

    try {
      const params = new URLSearchParams();
      if (filters.date) params.set("date", filters.date);

      const query = params.toString();
      entries.value = await apiRequest(`/nutrition${query ? `?${query}` : ""}`);
      return entries.value;
    } finally {
      isLoading.value = false;
    }
  };

  const addEntry = async (entryData) => {
    isLoading.value = true;

    try {
      const entry = await apiRequest("/nutrition", {
        method: "POST",
        body: JSON.stringify(entryData),
      });
      entries.value.unshift(entry);
      return entry;
    } finally {
      isLoading.value = false;
    }
  };

  const addEntryFromFood = async (entryData) => {
    isLoading.value = true;
    try {
      const entry = await apiRequest("/nutrition/from-food", {
        method: "POST",
        body: JSON.stringify(entryData),
      });
      entries.value.unshift(entry);
      return entry;
    } finally {
      isLoading.value = false;
    }
  };

  const addEntryFromBarcode = async (entryData) => {
    isLoading.value = true;
    try {
      const entry = await apiRequest("/nutrition/from-barcode", {
        method: "POST",
        body: JSON.stringify(entryData),
      });
      entries.value.unshift(entry);
      return entry;
    } finally {
      isLoading.value = false;
    }
  };

  const updateEntry = async (entryId, entryData) => {
    isLoading.value = true;

    try {
      const updatedEntry = await apiRequest(`/nutrition/${entryId}`, {
        method: "PATCH",
        body: JSON.stringify(entryData),
      });
      const index = entries.value.findIndex((entry) => entry.id === entryId);
      if (index !== -1) entries.value[index] = updatedEntry;
      return updatedEntry;
    } finally {
      isLoading.value = false;
    }
  };

  const recalculateEntry = async (entry, servingGrams) => {
    isLoading.value = true;
    try {
      // Los códigos comerciales suelen tener entre 8 y 14 dígitos. Los demás
      // identificadores corresponden a la búsqueda por nombre de CalorieAPI.
      const isBarcode = /^\d{8,14}$/.test(String(entry.external_food_id || ""));
      const updatedEntry = await apiRequest(
        `/nutrition/${isBarcode ? "from-barcode" : "from-food"}/${entry.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(
            isBarcode
              ? { serving_grams: Number(servingGrams) }
              : { portion_grams: Number(servingGrams), quantity: 1 },
          ),
        },
      );
      const index = entries.value.findIndex((current) => current.id === entry.id);
      if (index !== -1) entries.value[index] = updatedEntry;
      return updatedEntry;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteEntry = async (entryId) => {
    isLoading.value = true;

    try {
      await apiRequest(`/nutrition/${entryId}`, { method: "DELETE" });
      entries.value = entries.value.filter((entry) => entry.id !== entryId);
    } finally {
      isLoading.value = false;
    }
  };

  const clearEntries = () => {
    entries.value = [];
  };

  return {
    entries,
    isLoading,
    todayEntries,
    totalCaloriesToday,
    totalProteinToday,
    totalCarbsToday,
    totalFatToday,
    loadEntries,
    addEntry,
    addEntryFromFood,
    addEntryFromBarcode,
    updateEntry,
    recalculateEntry,
    deleteEntry,
    clearEntries,
  };
});
