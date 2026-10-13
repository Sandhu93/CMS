<template>
  <div class="w-full mb-8 py-2 fixed top-0 mx-auto flex items-center gap-4">
    <div
      :class="`${
        online ? 'bg-m-green/20' : 'bg-new-blue/20'
      } backdrop-blur-lg rounded-lg drop-shadow-2xl px-16 py-2 mx-auto flex items-center gap-4`"
    >
      <span class="relative flex h-3 w-3">
        <span
          :class="`animate-ping absolute inline-flex h-full w-full rounded-full ${
            !online ? 'bg-new-blue' : 'bg-m-green'
          } opacity-75`"
        ></span>
        <span
          :class="`relative inline-flex rounded-full h-3 w-3 ${
            !online ? 'bg-new-blue' : 'bg-m-green'
          }`"
        ></span>
      </span>
      <h1 class="font-montserrat font-normal text-white text-lg text-center">
        Server is {{ online ? "online" : "offline" }}
      </h1>
    </div>
  </div>
</template>
<script setup>
const { online } = defineProps(["online"]);
</script>
