import { formatMinutes } from "@/utils/durationUtils";
import { computed, toValue } from "vue";
import { parseLocalDate } from "@/utils/dateUtils";

const startOfCurrentWeek = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date;
};

export const useActivityMetrics = (entries) => {
  const summary = computed(() => {
    const weekEntries = toValue(entries).filter(
      (entry) => parseLocalDate(entry.log_date) >= startOfCurrentWeek(),
    );
    const calories = weekEntries.reduce(
      (total, entry) => total + Number(entry.calories_burned || 0),
      0,
    );
    const minutes = weekEntries.reduce(
      (total, entry) => total + Number(entry.duration_minutes || 0),
      0,
    );

    return {
      sessions: weekEntries.length,
      calories,
      minutes,
      averageCalories: weekEntries.length ? Math.round(calories / weekEntries.length) : 0,
      formattedTime: formatMinutes(minutes),
    };
  });

  return { summary };
};
