import { ref } from "vue";
import { defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

const round = (value) => Math.round(Number(value || 0) * 10) / 10;

const findNutrient = (food, names, expectedUnit) => {
  const normalizedNames = names.map((name) => name.toLowerCase());
  const nutrient = food.nutrients?.find((item) => {
    const name = String(item.nutrientName || item.name || "").toLowerCase();
    const unit = String(item.unitName || item.unit || "").toUpperCase();
    return normalizedNames.includes(name) && (!expectedUnit || unit === expectedUnit);
  });
  return round(nutrient?.value ?? nutrient?.amount);
};

const normalizeFood = (food) => ({
  externalId: String(food.fdcId),
  name: food.description,
  brand: food.brandOwner,
  servingSize: food.servingSize,
  servingSizeUnit: food.servingSizeUnit,
  calories100g: findNutrient(food, ["Energy"], "KCAL"),
  protein100g: findNutrient(food, ["Protein"]),
  carbs100g: findNutrient(food, ["Carbohydrate, by difference", "Carbohydrate"]),
  fat100g: findNutrient(food, ["Total lipid (fat)", "Total fat"]),
});

export const useFoodStore = defineStore("foods", () => {
  const foods = ref([]);
  const totalHits = ref(0);
  const isLoading = ref(false);
  let searchVersion = 0;

  const searchFoods = async (query) => {
    const currentVersion = ++searchVersion;
    isLoading.value = true;

    try {
      const result = await apiRequest(`/foods/search?q=${encodeURIComponent(query.trim())}`);

      // Si el usuario cerró el desplegable o inició otra búsqueda mientras la
      // petición estaba en curso, su respuesta ya no debe repoblar la lista.
      if (currentVersion !== searchVersion) return [];

      foods.value = result.foods.map(normalizeFood);
      totalHits.value = result.totalHits;
      return foods.value;
    } finally {
      if (currentVersion === searchVersion) isLoading.value = false;
    }
  };

  const clearSearch = () => {
    searchVersion += 1;
    foods.value = [];
    totalHits.value = 0;
    isLoading.value = false;
  };

  return { foods, totalHits, isLoading, searchFoods, clearSearch };
});
