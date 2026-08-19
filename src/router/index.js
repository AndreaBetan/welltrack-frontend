import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import GoalsOnboardingView from "@/views/onboarding/GoalsOnboardingView.vue";
import ActivityView from "@/views/activity/ActivityView.vue";
import DashboardView from "@/views/dashboard/DashboardView.vue";
import NutritionView from "@/views/nutrition/NutritionView.vue";
import ProfileView from "@/views/profile/ProfileView.vue";
import RecommendationsView from "@/views/recommendations/RecommendationsView.vue";
import SleepView from "@/views/sleep/SleepView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: { name: "login" },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/registro",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/configurar-objetivos",
      name: "goals-onboarding",
      component: GoalsOnboardingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      meta: { requiresAuth: true },
      component: DashboardView,
    },
    {
      path: "/alimentacion",
      name: "nutrition",
      meta: { requiresAuth: true },
      component: NutritionView,
    },
    {
      path: "/actividad-fisica",
      name: "activity",
      meta: { requiresAuth: true },
      component: ActivityView,
    },
    {
      path: "/sueno",
      name: "sleep",
      meta: { requiresAuth: true },
      component: SleepView,
    },
    {
      path: "/recomendaciones",
      name: "recommendations",
      meta: { requiresAuth: true },
      component: RecommendationsView,
    },
    {
      path: "/perfil",
      name: "profile",
      meta: { requiresAuth: true },
      component: ProfileView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "dashboard" },
    },
  ],
});

router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem("WTK"));

  if (to.meta.requiresAuth && !hasToken) {
    return { name: "login" };
  }

  if (hasToken && (to.name === "login" || to.name === "register")) {
    return { name: "dashboard" };
  }
});

export default router;
