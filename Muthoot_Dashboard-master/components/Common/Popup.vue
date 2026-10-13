<template>
  <div
    :class="`w-full ${
      show ? '' : 'hidden'
    } mb-8 py-2 fixed z-50 bottom-0 mx-auto flex items-center gap-4`"
  >
    <div
      :class="`${
        color == 'green' ? 'bg-m-green/20' : 'bg-m-red/20'
      } backdrop-blur-lg rounded-lg drop-shadow-2xl px-16 py-2 mx-auto flex items-center gap-4`"
    >
      <span class="relative flex h-3 w-3">
        <span
          :class="`animate-ping absolute inline-flex h-full w-full rounded-full ${
            color === 'green' ? 'bg-m-green' : 'bg-m-red'
          } opacity-75`"
        ></span>
        <span
          :class="`relative inline-flex rounded-full h-3 w-3 ${
            color === 'green' ? 'bg-m-green' : 'bg-m-red'
          }`"
        ></span>
      </span>
      <h1 class="font-montserrat font-normal text-white text-lg text-center">
        {{ text }}
      </h1>
    </div>
  </div>
</template>
<script setup>
const color = ref("green");
const show = ref(false);
const text = ref("");
const emit = defineEmits(["rmFromArray"]);
const update = (newText, newColor) => {
  show.value = true;
  text.value = newText;
  color.value = newColor;
  setTimeout(() => {
    emit("rmFromArray");
    show.value = false;
  }, 5000);
};
defineExpose({
  update,
});
</script>
