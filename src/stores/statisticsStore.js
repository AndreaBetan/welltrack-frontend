import { ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useStatisticsStore = defineStore("statistics", () => {
  const summary = ref(null);
  const trends = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const loadStatistics = async ({ from, to }) => {
    isLoading.value = true;
    error.value = null;
    const params = new URLSearchParams({ from, to });

    try {
      const [summaryResult, trendsResult] = await Promise.all([
        apiRequest(`/statistics/summary?${params}`),
        apiRequest(`/statistics/trends?${params}`),
      ]);
      summary.value = summaryResult;
      trends.value = trendsResult;
      return { summary: summaryResult, trends: trendsResult };
    } catch (requestError) {
      error.value = requestError.message;
      throw requestError;
    } finally {
      isLoading.value = false;
    }
  };

  const clearStatistics = () => {
    summary.value = null;
    trends.value = null;
    error.value = null;
  };

  return { summary, trends, isLoading, error, loadStatistics, clearStatistics };
});
