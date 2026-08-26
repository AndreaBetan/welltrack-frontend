import { computed, toValue } from "vue";

export const useSleepMetrics = (entries) => {
  const averageDuration = computed(() => {
    const currentEntries = toValue(entries);
    if (!currentEntries.length) return 0;

    const total = currentEntries.reduce(
      (sum, entry) => sum + Number(entry.duration_minutes || 0),
      0,
    );
    return Math.round(total / currentEntries.length);
  });

  return { averageDuration };
};
