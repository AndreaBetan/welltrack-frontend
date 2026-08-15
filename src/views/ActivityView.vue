<template>
  <section class="grid gap-7">
    <header class="max-w-[760px]">
      <p class="mb-2 font-extrabold text-[#b98a81] uppercase">Movimiento</p>
      <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-extrabold">
        Actividad física
      </h1>
      <p class="mt-3 text-[1.05rem] leading-relaxed text-[#573e33]/75">
        Haz seguimiento de pasos, entrenamientos y recuperacion.
      </p>
    </header>

    <div class="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Entreno</span>
        <strong class="mt-3 block text-[1.9rem]">45 min</strong>
        <p class="mt-2.5 text-[#573e33]/65">Fuerza tren superior</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Pasos</span>
        <strong class="mt-3 block text-[1.9rem]">8.240</strong>
        <p class="mt-2.5 text-[#573e33]/65">82% del objetivo</p>
      </article>

      <article class="rounded-lg border border-[#b98a81]/35 bg-white p-[22px]">
        <span class="font-bold text-[#573e33]/75">Frecuencia media</span>
        <strong class="mt-3 block text-[1.9rem]">118 bpm</strong>
        <p class="mt-2.5 text-[#573e33]/65">Zona moderada</p>
      </article>
    </div>

    <section class="border-t border-[#b98a81]/35 pt-6">
      <h2 class="mb-3.5 text-2xl font-bold">Rutina pendiente</h2>
      <ul class="grid gap-2.5 pl-5 leading-relaxed text-[#573e33]/80">
        <li>10 minutos de movilidad.</li>
        <li>20 minutos de caminata ligera.</li>
        <li>Estiramientos al finalizar el dia.</li>
      </ul>
    </section>
  </section>
</template>
