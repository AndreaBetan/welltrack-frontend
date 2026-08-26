<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useFoodStore } from "@/stores/foodStore";
import { useToastStore } from "@/stores/toastStore";

const emit = defineEmits(["select"]);
const props = defineProps({
  autoOpen: { type: Boolean, default: false },
  selectedId: { type: [String, Number], default: null },
});
const foodStore = useFoodStore();
const toastStore = useToastStore();
const searchInput = ref(null);
const searchTerm = ref("");
const searchMode = ref("name");
const hasSearched = ref(false);
const selectedFoodId = ref(null);

const closeDropdown = () => {
  searchTerm.value = "";
  hasSearched.value = false;
  foodStore.clearSearch();
};

const handleSearch = async () => {
  const query = searchTerm.value.trim();

  if (searchMode.value === "barcode") {
    const barcode = query.replace(/[^\d]/g, "");
    if (![8, 12, 13, 14].includes(barcode.length)) {
      toastStore.notify("Introduce un código UPC o EAN de 8, 12, 13 o 14 dígitos", "error");
      return;
    }

    try {
      const food = await foodStore.getFoodByBarcode(barcode);
      emit("select", food);
      closeDropdown();
    } catch (error) {
      toastStore.notify(error.message, "error");
    }
    return;
  }

  if (query.length < 2) {
    hasSearched.value = false;
    toastStore.notify("Escribe al menos dos caracteres para buscar", "error");
    return;
  }

  try {
    await foodStore.searchFoods(query);
    hasSearched.value = true;
  } catch (error) {
    toastStore.notify(error.message, "error");
  }
};

const selectFood = async (food) => {
  selectedFoodId.value = food.externalId;
  try {
    const details = await foodStore.getFoodDetails(food.externalId);
    emit("select", details);
  } catch (error) {
    toastStore.notify(error.message, "error");
  } finally {
    selectedFoodId.value = null;
  }
};

onMounted(async () => {
  if (props.autoOpen) {
    await nextTick();
    searchInput.value?.focus();
  }
});
</script>

<template>
  <section class="min-w-0 rounded-xl border border-[#b98a81]/25 bg-white p-4">
    <h3 class="text-lg font-extrabold">¿Qué has comido?</h3>
    <div class="mt-4 flex border-b border-[#b98a81]/20">
      <button
        type="button"
        class="relative px-1 pb-3 pr-5 text-sm font-bold transition"
        :class="searchMode === 'name' ? 'text-[#573e33] after:absolute after:right-5 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#b06f60]' : 'text-[#573e33]/50'"
        @click="searchMode = 'name'; searchTerm = ''; hasSearched = false; foodStore.clearSearch()"
      >
        Por nombre
      </button>
      <button
        type="button"
        class="relative px-5 pb-3 text-sm font-bold transition"
        :class="searchMode === 'barcode' ? 'text-[#573e33] after:absolute after:right-5 after:bottom-0 after:left-5 after:h-0.5 after:bg-[#b06f60]' : 'text-[#573e33]/50'"
        @click="searchMode = 'barcode'; searchTerm = ''; hasSearched = false; foodStore.clearSearch()"
      >
        Por código de barras
      </button>
    </div>

    <!-- La consulta solo se envía mediante Enter o el botón para proteger la
         cuota; escribir por sí solo no reemplaza los resultados anteriores. -->
    <form class="mt-4 flex gap-2" role="search" @submit.prevent="handleSearch">
      <div class="relative min-w-0 flex-1">
        <input
          ref="searchInput"
          v-model="searchTerm"
          type="text"
          role="combobox"
          autocomplete="off"
          :placeholder="searchMode === 'barcode' ? 'Introduce el código UPC o EAN' : 'Buscar y seleccionar un alimento'"
          :inputmode="searchMode === 'barcode' ? 'numeric' : 'search'"
          class="h-12 w-full rounded-lg border border-[#b98a81]/35 bg-white px-4 outline-none transition hover:border-[#573e33] focus:border-[#573e33] focus:ring-4 focus:ring-[#b98a81]/15"
          :aria-expanded="hasSearched"
          aria-autocomplete="list"
          aria-controls="food-options"
          @keydown.esc="closeDropdown"
        />
      </div>
      <button
        type="submit"
        :disabled="foodStore.isLoading || foodStore.isLoadingBarcode"
        class="h-12 shrink-0 rounded-lg bg-[#573e33] px-5 font-bold text-white transition hover:bg-[#6d4d40] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ foodStore.isLoading || foodStore.isLoadingBarcode ? "Buscando..." : "Buscar" }}
      </button>
    </form>

    <div v-if="searchMode === 'name' && (foodStore.isLoading || hasSearched)" class="mt-5">
      <div class="mb-2 flex items-center justify-between gap-3 px-1">
        <strong class="text-sm">Resultados encontrados</strong>
        <span v-if="hasSearched" class="text-xs text-[#573e33]/50">
          {{ foodStore.totalHits }} encontrados
        </span>
      </div>
      <div id="food-options" class="max-h-[390px] overflow-y-auto rounded-lg border border-[#b98a81]/20" role="listbox">
        <p v-if="foodStore.isLoading" class="px-4 py-8 text-center text-sm text-[#573e33]/60">
          Buscando alimentos...
        </p>

        <template v-else>
          <button
            v-for="food in foodStore.foods"
            :key="food.externalId"
            type="button"
            role="option"
            :disabled="foodStore.isLoadingDetails"
            class="flex w-full items-center gap-3 border-b border-[#b98a81]/15 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f7f1ec]"
            :class="props.selectedId === food.externalId ? 'bg-[#fbf0eb] ring-1 ring-inset ring-[#b98a81]' : ''"
            @click="selectFood(food)"
          >
            <div class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <strong class="text-[#573e33]">{{ food.name }}</strong>
                <span
                  v-if="food.verified"
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-emerald-700"
                >
                  Verificado
                </span>
              </span>
              <span v-if="food.brand" class="mt-0.5 block truncate text-xs text-[#573e33]/50">
                {{ food.brand }}
              </span>
              <span class="mt-1 block text-xs text-[#573e33]/65">
                P {{ food.protein100g }} g · C {{ food.carbs100g }} g · G {{ food.fat100g }} g / 100 g
              </span>
            </div>
            <div class="shrink-0 text-right">
              <strong class="block text-sm">{{ food.calories100g }} kcal</strong>
              <span class="text-[0.65rem] text-[#573e33]/50">por 100 g</span>
            </div>
            <span
              v-if="selectedFoodId === food.externalId"
              class="shrink-0 text-xs font-semibold text-[#a46f62]"
            >
              Cargando...
            </span>
          </button>

          <p
            v-if="hasSearched && !foodStore.foods.length"
            class="px-4 py-8 text-center text-sm text-[#573e33]/60"
          >
            No encontramos alimentos. Prueba con otro nombre o una búsqueda más general.
          </p>
        </template>
      </div>
    </div>
  </section>
</template>
