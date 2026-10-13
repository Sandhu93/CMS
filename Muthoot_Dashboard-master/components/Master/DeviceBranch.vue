<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl"
        >Branch Information</span
      >
      <span class="opacity-80 font-light"
        >Preview of entered branch details</span
      >
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <div class="flex w-full">
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Name')"
          :data="name"
          :title="'Branch Name'"
          :placeholder="'Kadavanthra'"
          :disabled="true"
          class="w-3/4 mr-2"
        />
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Code')"
          :data="code"
          :title="'Branch Code'"
          :placeholder="'KOD'"
          :disabled="true"
          class="w-1/4 ml-2"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const { code, name } = defineProps(["code", "name"]);
const emit = defineEmits(["update"]);
</script>
