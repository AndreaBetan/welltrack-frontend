import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiRequest } from "@/services/apiService";

export const useRecommendationStore = defineStore("recommendations", () => {
  const recommendations = ref([]);
  const selectedDate = ref("");
  const generatedAt = ref(null);
  const period = ref(null);
  const timeZone = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const hasRecommendations = computed(() => recommendations.value.length > 0);

  const loadRecommendations = async (date) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);

      const query = params.toString();
      const result = await apiRequest(`/recommendations${query ? `?${query}` : ""}`);

      recommendations.value = Array.isArray(result.recommendations) ? result.recommendations : [];
      selectedDate.value = result.date || date || "";
      generatedAt.value = result.generated_at || null;
      period.value = result.period || null;
      timeZone.value = result.time_zone || null;

      return result;
    } catch (requestError) {
      error.value = requestError.message;
      throw requestError;
    } finally {
      isLoading.value = false;
    }
  };

  const clearRecommendations = () => {
    recommendations.value = [];
    selectedDate.value = "";
    generatedAt.value = null;
    period.value = null;
    timeZone.value = null;
    error.value = null;
  };

  return {
    recommendations,
    selectedDate,
    generatedAt,
    period,
    timeZone,
    isLoading,
    error,
    hasRecommendations,
    loadRecommendations,
    clearRecommendations,
  };
});
