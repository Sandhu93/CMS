<template>
  <div class="flex gap-2 gap-x-20 justify-between">
    <div class="flex flex-col gap-5">
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <div class="w-4 h-12 bg-[#AA50ED] rounded-sm"></div>
          <h1 class="w-20 text-white font-montserrat">Panic Button</h1>
        </div>
        <h1 class="text-white font-montserrat text-xl">
          {{ pieData[0] }}
        </h1>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <div class="w-4 h-4 bg-[#4D5CDB] rounded-sm"></div>
          <h1 class="w-20 text-white font-montserrat">Keypad</h1>
        </div>
        <h1 class="text-white font-montserrat text-xl">
          {{ pieData[2] }}
        </h1>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <div class="w-4 h-4 bg-[#0CA9D1] rounded-sm"></div>
          <h1 class="w-20 text-white font-montserrat">Battery</h1>
        </div>
        <h1 class="text-white font-montserrat text-xl">
          {{ pieData[4] }}
        </h1>
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex items-center justify-between">
          <div class="flex gap-2 items-center">
            <div class="w-4 h-12 bg-[#FCDD51] rounded-sm"></div>
            <h1 class="w-20 text-white font-montserrat">Shutter Contact</h1>
          </div>
          <h1 class="text-white font-montserrat text-xl">
            {{ pieData[1] }}
          </h1>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <div class="w-4 h-4 bg-[#FEA047] rounded-sm"></div>
          <h1 class="w-20 text-white font-montserrat">Hooter</h1>
        </div>
        <h1 class="text-white font-montserrat text-xl">
          {{ pieData[3] }}
        </h1>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <div class="w-4 h-4 bg-[#F4557A] rounded-sm"></div>
          <h1 class="w-20 text-white font-montserrat">Panel</h1>
        </div>
        <h1 class="text-white font-montserrat text-xl">
          {{ pieData[5] }}
        </h1>
      </div>
    </div>
  </div>
</template>
<script setup>
const { pieData } = defineProps(["pieData"]);
</script>
