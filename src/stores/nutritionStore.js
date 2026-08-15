import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { storageService } from "@/services/storageService";

const STORAGE_KEY = "welltrack:nutrition";
const today = () => new Date().toISOString().slice(0, 10);

export const useNutritionStore = defineStore("nutrition", () => {
  const entries = ref(storageService.get(STORAGE_KEY));
  const isLoading = ref(false);

  const todayEntries = computed(() => entries.value.filter((entry) => entry.date === today()));
  const totalCaloriesToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.calories), 0),
  );
  const totalProteinToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.protein), 0),
  );

  const addEntry = (entry) => {
    isLoading.value = true;
    entries.value = [
      {
        id: crypto.randomUUID(),
        date: entry.date,
        calories: Number(entry.calories),
        protein: Number(entry.protein),
        fat: Number(entry.fat),
        carbs: Number(entry.carbs),
      },
      ...entries.value,
    ];
    isLoading.value = false;
  };

  watch(entries, (value) => storageService.set(STORAGE_KEY, value), { deep: true });

  return { entries, isLoading, totalCaloriesToday, totalProteinToday, addEntry };
});
