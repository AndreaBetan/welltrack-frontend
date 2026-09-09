import { round, roundNullable } from "@/utils/numberUtils";
import { ref } from "vue";
import { acceptHMRUpdate, defineStore } from "pinia";
import { apiRequest } from "@/services/apiService";

const normalizePortions = (portions = []) =>
  portions
    .map((portion) => ({
      id: portion.id,
      grams: Number(portion.grams),
      label: portion.label || `${portion.grams} g`,
      originalLabel: portion.originalLabel ?? null,
      nutritionMultiplier: Number(portion.nutritionMultiplier ?? portion.grams / 100),
    }))
    .filter((portion) => Number.isFinite(portion.grams) && portion.grams > 0);

const resolveDefaultServingGrams = (food, portions) => {
  const defaultPortion = food.defaultPortion;
  const explicitGrams = Number(
    typeof defaultPortion === "object"
      ? (defaultPortion?.grams ?? defaultPortion?.servingSize)
      : null,
  );

  if (Number.isFinite(explicitGrams) && explicitGrams > 0) return explicitGrams;

  const defaultLabel =
    typeof defaultPortion === "string" ? defaultPortion : defaultPortion?.label;
  if (defaultLabel) {
    const normalizedLabel = defaultLabel.trim().toLowerCase();
    const matchingPortion = portions.find((portion) => {
      const portionLabel = String(portion.originalLabel ?? portion.label).trim().toLowerCase();
      return portionLabel === normalizedLabel || portionLabel.includes(normalizedLabel);
    });
    if (matchingPortion) return matchingPortion.grams;
  }

  const servingSize = Number(food.servingSize);
  if (Number.isFinite(servingSize) && servingSize > 1) return servingSize;

  // La porción de 1 g sirve para cálculos, pero no es una cantidad inicial útil
  // cuando la API también entrega una porción doméstica del alimento.
  return portions.find((portion) => portion.grams > 1)?.grams ?? portions[0]?.grams ?? 100;
};

// La búsqueda devuelve información resumida para construir el listado.
const normalizeSearchFood = (food) => ({
  externalId: food.externalFoodId == null ? "" : String(food.externalFoodId),
  name: food.name,
  brand: food.brand === "Verified" ? null : (food.brand ?? null),
  verified: Boolean(food.verified),
  calories100g: round(food.calories),
  protein100g: round(food.protein),
  carbs100g: round(food.carbs),
  fat100g: round(food.fat),
});

// Los tamaños de porción solo se consideran definitivos después de consultar
// GET /foods/:id al seleccionar un resultado.
const normalizeFoodDetails = (food) => {
  const portions = normalizePortions(food.portions);
  const servingSize = resolveDefaultServingGrams(food, portions);
  return {
    externalId: food.externalFoodId == null ? "" : String(food.externalFoodId),
    name: food.name,
    brand: food.brand === "Verified" ? null : (food.brand ?? null),
    verified: Boolean(food.verified),
    portions,
    defaultPortion: food.defaultPortion ?? null,
    servingSize,
    servingSizeUnit: "g",
    customGramsAllowed: Boolean(food.customGramsAllowed),
    calories100g: roundNullable(food.nutritionPer100g?.calories),
    protein100g: roundNullable(food.nutritionPer100g?.protein),
    carbs100g: roundNullable(food.nutritionPer100g?.carbs),
    fat100g: roundNullable(food.nutritionPer100g?.fat),
    fiber100g: roundNullable(food.nutritionPer100g?.fiber),
    sugar100g: roundNullable(food.nutritionPer100g?.sugar),
  };
};

const normalizeBarcodeFood = (food) => {
  const servingGrams =
    String(food.serving?.unit ?? "").toLowerCase() === "g"
      ? Number(food.serving?.quantity)
      : null;
  const portions =
    Number.isFinite(servingGrams) && servingGrams > 0
      ? [
          {
            id: "barcode-serving",
            label: food.serving.label || `${servingGrams} g`,
            grams: servingGrams,
            nutritionMultiplier: servingGrams / 100,
          },
        ]
      : [];

  return {
    externalId: String(food.barcode),
    barcode: String(food.barcode),
    sourceType: "barcode",
    name: food.name || food.genericName || "Producto sin nombre",
    brand: food.brand ?? null,
    verified: false,
    portions,
    servingSize: portions[0]?.grams ?? 100,
    servingSizeUnit: "g",
    customGramsAllowed: Boolean(food.customGramsAllowed),
    calories100g: round(food.nutritionPer100g?.calories),
    protein100g: round(food.nutritionPer100g?.protein),
    carbs100g: round(food.nutritionPer100g?.carbs),
    fat100g: round(food.nutritionPer100g?.fat),
    fiber100g: round(food.nutritionPer100g?.fiber),
    sugar100g: round(food.nutritionPer100g?.sugar),
  };
};

export const useFoodStore = defineStore("foods", () => {
  const foods = ref([]);
  const totalHits = ref(0);
  const isLoading = ref(false);
  const isLoadingDetails = ref(false);
  const isLoadingBarcode = ref(false);
  const isCalculating = ref(false);
  const detailsCache = new Map();
  let searchVersion = 0;

  const searchFoods = async (query) => {
    const currentVersion = ++searchVersion;
    isLoading.value = true;

    try {
      const result = await apiRequest(`/foods/search?q=${encodeURIComponent(query.trim())}`);

      // Si el usuario cerró el desplegable o inició otra búsqueda mientras la
      // petición estaba en curso, su respuesta ya no debe repoblar la lista.
      if (currentVersion !== searchVersion) return [];

      if (!Array.isArray(result?.foods)) {
        throw new Error("La respuesta de búsqueda de alimentos no tiene el formato esperado");
      }

      foods.value = result.foods
        .map(normalizeSearchFood)
        .filter((food) => food.externalId && food.name)
        .sort((first, second) => Number(second.verified) - Number(first.verified));
      totalHits.value = Number(result.total ?? foods.value.length);
      return foods.value;
    } finally {
      if (currentVersion === searchVersion) isLoading.value = false;
    }
  };

  const getFoodDetails = async (foodId) => {
    const normalizedId = String(foodId);
    if (detailsCache.has(normalizedId)) return detailsCache.get(normalizedId);

    isLoadingDetails.value = true;
    try {
      const result = await apiRequest(`/foods/${encodeURIComponent(normalizedId)}`);
      const food = normalizeFoodDetails(result);
      detailsCache.set(normalizedId, food);
      return food;
    } finally {
      isLoadingDetails.value = false;
    }
  };

  const getFoodByBarcode = async (barcode) => {
    isLoadingBarcode.value = true;
    try {
      const result = await apiRequest(`/foods/barcode/${encodeURIComponent(barcode)}`);
      return normalizeBarcodeFood(result);
    } finally {
      isLoadingBarcode.value = false;
    }
  };

  const calculateFoodPortion = async ({ foodId, portionGrams, quantity = 1 }) => {
    isCalculating.value = true;
    try {
      return await apiRequest("/foods/calculate", {
        method: "POST",
        body: JSON.stringify({
          food_id: foodId,
          portion_grams: Number(portionGrams),
          quantity: Number(quantity),
        }),
      });
    } finally {
      isCalculating.value = false;
    }
  };

  const clearSearch = () => {
    searchVersion += 1;
    foods.value = [];
    totalHits.value = 0;
    isLoading.value = false;
  };

  return {
    foods,
    totalHits,
    isLoading,
    isLoadingDetails,
    isLoadingBarcode,
    isCalculating,
    searchFoods,
    getFoodDetails,
    getFoodByBarcode,
    calculateFoodPortion,
    clearSearch,
  };
});

// Mantiene las acciones nuevas del store durante el desarrollo con Vite. Sin
// esto, una instancia creada antes de añadir getFoodDetails puede conservar el
// contrato anterior hasta reiniciar la aplicación.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFoodStore, import.meta.hot));
}
