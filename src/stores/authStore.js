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
        auth: false,
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
        auth: false,
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
      // El perfil protegido vive en el módulo de usuarios del backend.
      user.value = await apiRequest("/users/me");
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
      const updatedUser = await apiRequest("/users/me", {
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

  const requestPasswordReset = async (email) => {
    isLoading.value = true;

    try {
      return await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        auth: false,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async ({ token, password }) => {
    isLoading.value = true;

    try {
      return await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        auth: false,
      });
    } finally {
      isLoading.value = false;
    }
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
    requestPasswordReset,
    resetPassword,
  };
});
