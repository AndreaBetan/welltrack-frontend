import { ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useDashboardStore = defineStore("dashboard", () => {
  const snapshot = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const loadDashboard = async (date) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      const query = params.toString();
      snapshot.value = await apiRequest(`/dashboard${query ? `?${query}` : ""}`);
      return snapshot.value;
    } catch (requestError) {
      error.value = requestError.message;
      throw requestError;
    } finally {
      isLoading.value = false;
    }
  };

  const clearDashboard = () => {
    snapshot.value = null;
    error.value = null;
  };

  return { snapshot, isLoading, error, loadDashboard, clearDashboard };
});
