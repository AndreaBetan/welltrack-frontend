import { ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useGoalStore = defineStore("goals", () => {
  const goals = ref([]);
  const nutritionDistributions = ref({});
  const isLoading = ref(false);

  const loadGoals = async () => {
    isLoading.value = true;

    try {
      goals.value = await apiRequest("/goals");
      return goals.value;
    } finally {
      isLoading.value = false;
    }
  };

  const createGoal = async (goalData) => {
    isLoading.value = true;

    try {
      const goal = await apiRequest("/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });

      goals.value.unshift(goal);
      return goal;
    } finally {
      isLoading.value = false;
    }
  };

  // El onboarding puede crear varias metas de una sola vez. Se hacen las
  // peticiones en serie para saber exactamente cuál ha fallado y conservar en
  // el store cada objetivo que el backend confirme correctamente.
  const createGoals = async (goalsData) => {
    isLoading.value = true;

    try {
      const createdGoals = [];

      for (const goalData of goalsData) {
        const goal = await apiRequest("/goals", {
          method: "POST",
          body: JSON.stringify(goalData),
        });

        goals.value.unshift(goal);
        createdGoals.push(goal);
      }

      return createdGoals;
    } finally {
      isLoading.value = false;
    }
  };

  const updateGoal = async (goalId, goalData) => {
    isLoading.value = true;

    try {
      const updatedGoal = await apiRequest(`/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify(goalData),
      });

      const index = goals.value.findIndex((goal) => goal.id === goalId);

      if (index !== -1) {
        goals.value[index] = updatedGoal;
      }

      return updatedGoal;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteGoal = async (goalId) => {
    isLoading.value = true;

    try {
      await apiRequest(`/goals/${goalId}`, {
        method: "DELETE",
      });

      goals.value = goals.value.filter((goal) => goal.id !== goalId);
      delete nutritionDistributions.value[goalId];
    } finally {
      isLoading.value = false;
    }
  };

  const loadNutritionDistribution = async (goalId) => {
    try {
      const distribution = await apiRequest(`/goals/${goalId}/nutrition-distribution`);
      nutritionDistributions.value[goalId] = distribution;
      return distribution;
    } catch (error) {
      // No tener reparto es un estado válido: el objetivo puede guardar solo
      // calorías y permitir que el usuario lo configure después.
      if (error.status === 404) {
        delete nutritionDistributions.value[goalId];
        return null;
      }
      throw error;
    }
  };

  const loadNutritionDistributions = async () => {
    const calorieGoals = goals.value.filter((goal) => goal.goal_type === "daily_calories");
    await Promise.all(calorieGoals.map((goal) => loadNutritionDistribution(goal.id)));
    return nutritionDistributions.value;
  };

  const saveNutritionDistribution = async (goalId, distributionData) => {
    const distribution = await apiRequest(`/goals/${goalId}/nutrition-distribution`, {
      method: "PUT",
      body: JSON.stringify(distributionData),
    });
    nutritionDistributions.value[goalId] = distribution;
    return distribution;
  };

  const deleteNutritionDistribution = async (goalId) => {
    try {
      await apiRequest(`/goals/${goalId}/nutrition-distribution`, { method: "DELETE" });
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    delete nutritionDistributions.value[goalId];
  };

  const clearGoals = () => {
    goals.value = [];
    nutritionDistributions.value = {};
  };

  return {
    goals,
    nutritionDistributions,
    isLoading,
    loadGoals,
    createGoal,
    createGoals,
    updateGoal,
    deleteGoal,
    loadNutritionDistribution,
    loadNutritionDistributions,
    saveNutritionDistribution,
    deleteNutritionDistribution,
    clearGoals,
  };
});
