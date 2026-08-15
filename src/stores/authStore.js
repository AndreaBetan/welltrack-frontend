import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("WTK"));
  const isLoading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  const saveSession = (session) => {
    user.value = session.user;
    token.value = session.token;
    localStorage.setItem("WTK", session.token);
  };

  const login = async (credentials) => {
    isLoading.value = true;

    try {
      const session = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      saveSession(session);
      return session.user;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;

    try {
      const session = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      saveSession(session);
      return session.user;
    } finally {
      isLoading.value = false;
    }
  };

  const loadCurrentUser = async () => {
    if (!token.value) {
      return null;
    }

    isLoading.value = true;

    try {
      user.value = await apiRequest("/auth/me");
      return user.value;
    } catch (error) {
      logout();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (profileData) => {
    isLoading.value = true;

    try {
      const updatedUser = await apiRequest("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(profileData),
      });

      user.value = updatedUser;

      return updatedUser;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("WTK");
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    loadCurrentUser,
    updateProfile,
    logout,
  };
});
