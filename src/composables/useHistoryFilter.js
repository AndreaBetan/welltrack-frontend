import { computed, ref, toValue } from "vue";
import { parseLocalDate } from "@/utils/dateUtils";

export const useHistoryFilter = (entries, typeField) => {
  const typeFilter = ref("all");
  const periodFilter = ref("7");
  const filteredEntries = computed(() => {
    let minimumDate = null;
    if (periodFilter.value !== "all") {
      minimumDate = new Date();
      minimumDate.setHours(0, 0, 0, 0);
      minimumDate.setDate(minimumDate.getDate() - Number(periodFilter.value) + 1);
    }
    return toValue(entries).filter((entry) =>
      (typeFilter.value === "all" || entry[typeField] === typeFilter.value) &&
      (!minimumDate || parseLocalDate(entry.log_date) >= minimumDate),
    );
  });
  return { typeFilter, periodFilter, filteredEntries };
};
