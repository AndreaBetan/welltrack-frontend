<template>
  <section class="grid gap-7">
    <header class="max-w-[760px]">
      <p class="mb-2 font-extrabold text-[#b98a81] uppercase">Resumen diario</p>
      <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-extrabold">
        Dashboard
      </h1>
      <p class="mt-3 text-[1.05rem] leading-relaxed text-[#573e33]/75">
        Consulta de un vistazo tus principales indicadores de bienestar.
      </p>
    </header>

    <div class="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Calorias</span>
        <strong class="mt-3 block text-[1.9rem]">1.850 kcal</strong>
        <p class="mt-2.5 text-[#573e33]/65">72% del objetivo diario</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Actividad</span>
        <strong class="mt-3 block text-[1.9rem]">8.240 pasos</strong>
        <p class="mt-2.5 text-[#573e33]/65">Quedan 1.760 pasos</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Sueño</span>
        <strong class="mt-3 block text-[1.9rem]">7 h 20 min</strong>
        <p class="mt-2.5 text-[#573e33]/65">Calidad estable</p>
      </article>
    </div>

    <section class="border-t border-[#b98a81]/35 pt-6">
      <h2 class="mb-3.5 text-2xl font-bold">Plan de hoy</h2>
      <ul class="grid gap-2.5 pl-5 leading-relaxed text-[#573e33]/80">
        <li>Registrar comidas principales.</li>
        <li>Completar 30 minutos de actividad moderada.</li>
        <li>Preparar rutina de descanso antes de dormir.</li>
      </ul>
    </section>
  </section>
</template>
