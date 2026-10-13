<template>
  <div class="flex justify-between w-full items-center">
    <div class="flex gap-4 items-center">
      <span class="font-medium text-white">{{ index + 1 }}</span>
      <div class="flex flex-col">
        <span class="font-medium text-white text-lg">{{ role.name }}</span>
        <p class="font-light text-white/80 text-sm truncate w-96">
          {{ role.desc }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <SVGEditUsers
        v-if="allowEdit"
        @click="emit('dropDownEdit')"
        class="text-white/60 cursor-pointer hover:text-white"
      />
      <SVGDelete
        v-if="allowEdit"
        @click="emit('dropDownDelete')"
        class="text-white/60 cursor-pointer hover:text-white"
      />
    </div>
  </div>
</template>
<script setup>
const { index, role, allowEdit } = defineProps(["index", "role", "allowEdit"]);
const emit = defineEmits(["dropDownEdit", "dropDownDelete"]);
function updateList(list, index) {
  // listRef.value[index].selected = list;
  // emit("updateList", listRef.value);
}
</script>
