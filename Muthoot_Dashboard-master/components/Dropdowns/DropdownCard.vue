<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-4 items-center">
      <span class="font-medium text-white">{{ index + 1 }}</span>
      <div class="flex flex-col">
        <span class="font-medium text-white text-lg">{{ name }}</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <SVGDelete
        @click="emit('toggleDropDelete', name)"
        class="text-white/60 cursor-pointer hover:text-white"
      />
    </div>
  </div>
</template>
<script setup>
const { name, index } = defineProps(["name", "index"]);
const emit = defineEmits(["toggleDropDelete"]);
function updateList(list, index) {
  // listRef.value[index].selected = list;
  // emit("updateList", listRef.value);
}
</script>
