<script setup>
import { icons } from "@/icons";

defineProps({
  resource: { type: Object, required: true },
});

const resourceTypeLabels = {
  article: "Artículo",
  video: "Vídeo",
  audio: "Audio",
  guide: "Guía",
  exercise: "Ejercicio",
};

</script>

<template>
  <a
    :href="resource.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group grid h-full w-full grid-rows-[auto_1fr_auto_auto] content-start gap-3 rounded-xl border border-[#b98a81]/20 bg-white p-5 transition hover:border-[#b98a81]/45 hover:shadow-[0_12px_30px_rgba(87,62,51,0.06)]"
  >
    <header class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <span class="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#b8796c]">
          {{ resourceTypeLabels[resource.type] || "Recurso" }}
        </span>
        <strong class="mt-1.5 block text-base leading-snug text-[#573e33] group-hover:text-[#9f5f52]">
          {{ resource.title }}
        </strong>
      </div>
      <component :is="icons.actions.next" aria-hidden="true" class="mt-1 size-4 shrink-0 transition group-hover:translate-x-0.5" />
    </header>

    <p class="text-sm leading-relaxed text-[#573e33]/65">
      {{ resource.description }}
    </p>

    <footer class="grid gap-2 text-xs text-[#573e33]/55">
      <span v-if="resource.provider">
        Fuente: <strong class="font-bold text-[#573e33]/70">{{ resource.provider }}</strong>
      </span>
      <div class="flex flex-wrap gap-2">
        <template v-if="resource.duration_minutes">
          <span class="rounded-full bg-[#f7f1ec] px-2.5 py-1">{{ resource.duration_minutes }} min</span>
        </template>
      </div>
    </footer>

    <div
      v-if="resource.safety_note"
      class="flex items-start gap-3 border-t border-[#b98a81]/15 bg-[#fbf5f1] px-3.5 py-3 text-xs leading-relaxed text-[#573e33]/65"
    >
      <component :is="icons.common.health" aria-hidden="true" class="mt-0.5 size-4 shrink-0 text-[#d17a58]" />
      <span>{{ resource.safety_note }}</span>
    </div>
    <span v-else aria-hidden="true" class="min-h-4" />
  </a>
</template>
