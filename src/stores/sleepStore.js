import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { storageService } from "@/services/storageService";

const STORAGE_KEY = "welltrack:sleep";

const getHoursBetween = (start, end) => {
  if (!start || !end) return 0;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal <= startTotal) endTotal += 24 * 60;
  return Math.round(((endTotal - startTotal) / 60) * 10) / 10;
};

export const useSleepStore = defineStore("sleep", () => {
  const entries = ref(storageService.get(STORAGE_KEY));
  const isLoading = ref(false);

  const lastEntry = computed(() => entries.value[0] ?? null);
  const lastSleepHours = computed(() => lastEntry.value?.durationHours ?? 0);
  const averageQuality = computed(() => {
    if (!entries.value.length) return 0;
    const total = entries.value.reduce((sum, entry) => sum + Number(entry.quality), 0);
    return Math.round(total / entries.value.length);
  });

  const addEntry = (entry) => {
    isLoading.value = true;
    entries.value = [
      {
        id: crypto.randomUUID(),
        startTime: entry.startTime,
        endTime: entry.endTime,
        quality: Number(entry.quality),
        durationHours: getHoursBetween(entry.startTime, entry.endTime),
      },
      ...entries.value,
    ];
    isLoading.value = false;
  };

  watch(entries, (value) => storageService.set(STORAGE_KEY, value), { deep: true });

  return { entries, isLoading, lastEntry, lastSleepHours, averageQuality, addEntry };
});
