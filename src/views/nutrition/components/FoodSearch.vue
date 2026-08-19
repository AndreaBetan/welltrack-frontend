<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useFoodStore } from "@/stores/foodStore";
import { useToastStore } from "@/stores/toastStore";

const emit = defineEmits(["select"]);
const foodStore = useFoodStore();
const toastStore = useToastStore();
const container = ref(null);
const searchTerm = ref("");
const isOpen = ref(false);
const hasSearched = ref(false);
let timerId;

const openDropdown = () => {
  isOpen.value = true;
};

const closeDropdown = () => {
  isOpen.value = false;
  searchTerm.value = "";
  hasSearched.value = false;
  foodStore.clearSearch();
};

// Cierra el combobox únicamente si el click ocurrió fuera de todo el control.
// Así se puede escribir, hacer scroll y seleccionar una opción sin perderlo.
const handleOutsideClick = (event) => {
  if (isOpen.value && !container.value?.contains(event.target)) {
    closeDropdown();
  }
};

// El debounce reduce el número de peticiones mientras el usuario escribe.
watch(searchTerm, (value) => {
  window.clearTimeout(timerId);
  const query = value.trim();

  if (query.length < 2) {
    hasSearched.value = false;
    foodStore.clearSearch();
    return;
  }

  timerId = window.setTimeout(async () => {
    try {
      await foodStore.searchFoods(query);
      if (isOpen.value && searchTerm.value.trim() === query) {
        hasSearched.value = true;
      }
    } catch (error) {
      toastStore.notify(error.message, "error");
    }
  }, 450);
});

const selectFood = (food) => {
  emit("select", food);
  closeDropdown();
};

onMounted(() => document.addEventListener("mousedown", handleOutsideClick));

onBeforeUnmount(() => {
  window.clearTimeout(timerId);
  document.removeEventListener("mousedown", handleOutsideClick);
});
</script>

<template>
  <section ref="container" class="relative">
    <span class="mb-2 block text-sm font-semibold text-[#573e33]/75">
      Alimento consumido
    </span>

    <!-- Un único campo cumple las dos funciones: abre el desplegable y filtra
         sus opciones. No se renderiza un segundo buscador dentro del panel. -->
    <div class="relative">
      <input
        v-model="searchTerm"
        type="text"
        role="combobox"
        autocomplete="off"
        placeholder="Buscar y seleccionar un alimento"
        class="h-12 w-full rounded-lg border border-[#b98a81]/35 bg-white px-4 pr-11 outline-none transition hover:border-[#573e33] focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
        :aria-expanded="isOpen"
        aria-autocomplete="list"
        aria-controls="food-options"
        @focus="openDropdown"
        @click="openDropdown"
        @keydown.esc="closeDropdown"
      />
      <span
        class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg transition"
        :class="isOpen ? 'rotate-180' : ''"
      >
        ⌄
      </span>
    </div>

    <div
      v-if="isOpen"
      class="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-[#b98a81]/30 bg-white shadow-[0_22px_60px_rgba(87,62,51,0.2)]"
    >
      <div id="food-options" class="max-h-[360px] overflow-y-auto p-2" role="listbox">
        <p v-if="foodStore.isLoading" class="px-4 py-8 text-center text-sm text-[#573e33]/60">
          Buscando alimentos...
        </p>

        <template v-else>
          <button
            v-for="food in foodStore.foods"
            :key="food.externalId"
            type="button"
            role="option"
            class="block w-full rounded-lg px-4 py-3 text-left transition hover:bg-[#f7f1ec] focus:bg-[#f7f1ec] focus:outline-none"
            @click="selectFood(food)"
          >
            <span class="block font-bold text-[#573e33]">{{ food.name }}</span>
            <span v-if="food.brand" class="mt-0.5 block text-xs text-[#573e33]/50">
              {{ food.brand }}
            </span>
            <span class="mt-1 block text-xs text-[#573e33]/65">
              {{ food.calories100g }} kcal · P {{ food.protein100g }} g · C
              {{ food.carbs100g }} g · G {{ food.fat100g }} g / 100 g
            </span>
          </button>

          <p v-if="!hasSearched" class="px-4 py-8 text-center text-sm text-[#573e33]/60">
            Escribe el nombre de un alimento para ver resultados.
          </p>

          <p
            v-else-if="!foodStore.foods.length"
            class="px-4 py-8 text-center text-sm text-[#573e33]/60"
          >
            No encontramos alimentos. Prueba otro término, preferiblemente en inglés.
          </p>
        </template>
      </div>
    </div>
  </section>
</template>
