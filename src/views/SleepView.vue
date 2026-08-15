<template>
  <section class="grid gap-7">
    <header class="max-w-[760px]">
      <p class="mb-2 font-extrabold text-[#b98a81] uppercase">Descanso</p>
      <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-extrabold">
        Sueño
      </h1>
      <p class="mt-3 text-[1.05rem] leading-relaxed text-[#573e33]/75">
        Monitoriza duracion, regularidad y calidad del descanso.
      </p>
    </header>

    <div class="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Duracion</span>
        <strong class="mt-3 block text-[1.9rem]">7 h 20 min</strong>
        <p class="mt-2.5 text-[#573e33]/65">Dentro del rango recomendado</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Hora de dormir</span>
        <strong class="mt-3 block text-[1.9rem]">23:15</strong>
        <p class="mt-2.5 text-[#573e33]/65">15 min mas tarde que ayer</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Calidad</span>
        <strong class="mt-3 block text-[1.9rem]">84%</strong>
        <p class="mt-2.5 text-[#573e33]/65">Sueño profundo correcto</p>
      </article>
    </div>

    <section class="border-t border-[#b98a81]/35 pt-6">
      <h2 class="mb-3.5 text-2xl font-bold">Rutina nocturna</h2>
      <ul class="grid gap-2.5 pl-5 leading-relaxed text-[#573e33]/80">
        <li>Reducir pantallas 45 minutos antes.</li>
        <li>Preparar una habitacion fresca y oscura.</li>
        <li>Mantener una hora de descanso constante.</li>
      </ul>
    </section>
  </section>
</template>
