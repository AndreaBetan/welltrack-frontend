import { ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useGoalStore = defineStore("goals", () => {
  const goals = ref([]);
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
    } finally {
      isLoading.value = false;
    }
  };

  const clearGoals = () => {
    goals.value = [];
  };

  return {
    goals,
    isLoading,
    loadGoals,
    createGoal,
    createGoals,
    updateGoal,
    deleteGoal,
    clearGoals,
  };
});
