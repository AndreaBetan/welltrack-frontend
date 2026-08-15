import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { storageService } from "@/services/storageService";

const STORAGE_KEY = "welltrack:activity";
const today = () => new Date().toISOString().slice(0, 10);

export const useActivityStore = defineStore("activity", () => {
  const entries = ref(storageService.get(STORAGE_KEY));
  const isLoading = ref(false);

  const todayEntries = computed(() => entries.value.filter((entry) => entry.date === today()));
  const minutesToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.duration), 0),
  );
  const caloriesBurnedToday = computed(() =>
    todayEntries.value.reduce((total, entry) => total + Number(entry.caloriesBurned), 0),
  );

  const addEntry = (entry) => {
    isLoading.value = true;
    entries.value = [
      {
        id: crypto.randomUUID(),
        date: today(),
        type: entry.type.trim(),
        duration: Number(entry.duration),
        caloriesBurned: Number(entry.caloriesBurned),
      },
      ...entries.value,
    ];
    isLoading.value = false;
  };

  watch(entries, (value) => storageService.set(STORAGE_KEY, value), { deep: true });

  return { entries, isLoading, minutesToday, caloriesBurnedToday, addEntry };
});
