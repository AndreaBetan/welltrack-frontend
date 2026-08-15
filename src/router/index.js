import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/modules/auth/LoginView.vue";
import RegisterView from "@/modules/auth/RegisterView.vue";
import ActivityView from "@/modules/activity/ActivityView.vue";
import DashboardView from "@/modules/dashboard/DashboardView.vue";
import NutritionView from "@/modules/nutrition/NutritionView.vue";
import ProfileView from "@/modules/profile/ProfileView.vue";
import RecommendationsView from "@/modules/recommendations/RecommendationsView.vue";
import SleepView from "@/modules/sleep/SleepView.vue";

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
