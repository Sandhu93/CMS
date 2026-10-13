<template>
  <div class="bg-m-black w-1/4 h-1/2 rounded-lg shadow-xl relative p-5">
    <SVGCloseCross
      :size="'600'"
      class="absolute top-2 right-2 cursor-pointer"
      @click="() => emit('closeModal')"
    />
    <h1
      class="font-montserrat font-semibold text-white text-3xl text-center underline"
    >
      Zone Issues
    </h1>
    <div class="grid grid-cols-4 grid-rows-5 gap-3 mt-5 p-5">
      <span
        v-for="item in data"
        :key="item"
        class="text-white font-montserrat text-xl basis-1"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>
<script setup>
const { data } = defineProps(["data"]);
const emit = defineEmits(["closeModal"]);
</script>
