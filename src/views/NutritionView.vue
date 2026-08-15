<template>
  <section class="grid gap-7">
    <header class="max-w-[760px]">
      <p class="mb-2 font-extrabold text-[#b98a81] uppercase"> Nutrición </p>
      <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-extrabold"> Alimentación </h1>
      <p class="mt-3 text-[1.05rem] leading-relaxed text-[#573e33]/75">
        Organiza tus comidas, hidratación y objetivos nutricionales.
      </p>
    </header>

    <div class="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Proteína</span>
        <strong class="mt-3 block text-[1.9rem]">92 g</strong>
        <p class="mt-2.5 text-[#573e33]/65">Objetivo: 120 g</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Agua</span>
        <strong class="mt-3 block text-[1.9rem]">1,8 L</strong>
        <p class="mt-2.5 text-[#573e33]/65">Objetivo: 2,5 L</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Comidas</span>
        <strong class="mt-3 block text-[1.9rem]">3 / 5</strong>
        <p class="mt-2.5 text-[#573e33]/65">Faltan merienda y cena</p>
      </article>
    </div>

    <section class="border-t border-[#b98a81]/35 pt-6">
      <h2 class="mb-3.5 text-2xl font-bold">Registro rápido</h2>
      <ul class="grid gap-2.5 pl-5 leading-relaxed text-[#573e33]/80">
        <li>Desayuno: avena, fruta y cafe.</li>
        <li>Comida: arroz integral, pollo y verduras.</li>
        <li>Snack sugerido: yogur natural con nueces.</li>
      </ul>
    </section>
  </section>
</template>
