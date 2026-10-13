<template>
  <div class="bg-m-black-extralight w-full h-full rounded-lg px-2 py-3">
    <div v-for="item in listRef" :key="item.id" class="flex gap-4">
      <input
        type="checkbox"
        :value="item.selected"
        @change="handleFilter(item.id)"
        class="accent-m-green backdrop:bg-red-400 text-red-400 outline-none"
      />
      <span class="font-montserrat font-light">{{ item.name }}</span>
    </div>
  </div>
</template>
<script setup>
const { list } = defineProps(["list"]);
const emit = defineEmits(["updateList"]);
const listRef = ref(list);
function handleFilter(id) {
  listRef.value.forEach((item) => {
    if (item.id === id) {
      item.selected = !item.selected;
    }
  });
  emit("updateList", listRef.value);
}
</script>
