import { computed } from "vue";
import { icons } from "@/icons";

const intensityFromCode = (code = "") => {
  if (code.endsWith("_light")) return "low";
  if (code.endsWith("_moderate")) return "moderate";
  if (code.endsWith("_high")) return "high";
  return null;
};

export const useActivityCatalog = (activityStore) => {
  const activityTypes = computed(() =>
    activityStore.activityTypes.map((activityType) => {
      const value = activityType.code ?? activityType.value;
      const category = activityType.category ?? value?.split("_")[0];

      return {
        ...activityType,
        value,
        label: activityType.name ?? activityType.label,
        met: Number(activityType.met),
        intensity: activityType.intensity ?? intensityFromCode(value),
        icon: icons.activities[category] ?? icons.activities.other,
      };
    }),
  );

  const activitiesByCode = computed(
    () => new Map(activityTypes.value.map((activityType) => [activityType.value, activityType])),
  );

  const getActivity = (code) => activitiesByCode.value.get(code);

  return { activityTypes, activitiesByCode, getActivity };
};
