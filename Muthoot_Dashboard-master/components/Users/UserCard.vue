<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-4 items-center">
      <span class="font-medium text-white">{{ index + 1 }}</span>
      <div class="flex flex-col">
        <span class="font-medium text-white text-lg">{{ user.name }}</span>
        <span class="font-light text-white/80 text-sm">{{ user.email }}</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="px-5 py-2.5 bg-white/10 text-white rounded">{{ roles.find(i => i.value === user.role).name }}</div>
      <SVGEditUsers
        v-if="allowEdit"
        @click="emit('toggleDropEdit')"
        class="text-white/60 cursor-pointer hover:text-white"
      />
      <SVGDelete
        v-if="allowEdit"
        @click="emit('toggleDropDelete')"
        class="text-white/60 cursor-pointer hover:text-white"
      />
    </div>
  </div>
</template>
<script setup>
const { user, index, roles, allowEdit } = defineProps([
  "user",
  "index",
  "roles",
  "allowEdit",
]);
const emit = defineEmits(["toggleDropEdit", "toggleDropDelete"]);
const list = ref(roles);
function updateList(list, index) {
  // listRef.value[index].selected = list;
  // emit("updateList", listRef.value);
}
</script>
