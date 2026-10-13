<template>
  <div
    :class="`w-14 ${
      isDisabled ? `cursor-not-allowed` : `cursor-pointer`
    } relative transition duration-300 ease-in-out h-8 flex items-center rounded-full ${
      toggled
        ? `bg-m-green/30 hover:bg-discortics-blue-light/90`
        : `bg-white/10 ${isDisabled ? '' : 'hover:bg-frosty-button-hover'}`
    }`"
    @click="() => isDisabled || toggle()"
  >
    <div
      :class="`p-px flex justify-center items-center transition duration-300 ease-in-out transform absolute w-5 h-5 rounded-full ${
        toggled
          ? 'translate-x-6 absolute bg-m-green'
          : 'translate-x-1 bg-gray-400'
      } left-1 top-1 bottom-1 my-auto`"
    ></div>
  </div>
</template>
<script setup>
const { enabled, isDisabled } = defineProps(["enabled", "isDisabled"]);
let toggled = ref(enabled);
const emit = defineEmits(["update"]);
function emitUpdate() {
  emit("update", toggled.value);
}
function toggle() {
  toggled.value = !toggled.value;
  emitUpdate();
}
function toggleOn() {
  toggled.value = true;
}
function toggleOff() {
  toggled.value = false;
}
function getState() {
  return toggled.value;
}
</script>
