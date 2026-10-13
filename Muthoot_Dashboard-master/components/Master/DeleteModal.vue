<template>
  <div
    class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black/60 z-[100]"
  >
    <div
      class="w-[450px] px-6 py-8 text-white font-quicksand justify-around flex flex-col gap-4 bg-m-black-light rounded-lg relative"
    >
      <div class="flex flex-col">
        <span class="font-montserrat font-semibold text-2xl">{{ title || 'Confirm' }}</span>
        <span>{{ message || 'Do you wish to delete?' }}</span>
      </div>
      <div class="flex mx-auto gap-6">
        <button
          @click="handleSubmit('yes')"
          class="bg-m-red font-bold text-lg px-6 py-3 rounded w-[150px]"
        >
          Yes
        </button>
        <button
          @click="handleSubmit('no')"
          class="bg-white/10 font-bold text-lg px-6 py-3 rounded w-[150px]"
        >
          No
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationsStore } from "~/store/notifications";
const config = useRuntimeConfig();
const emit = defineEmits(["dropDownToggle", "finalSubmit"]);
const props = defineProps({
  title: String,
  message: String,
});
const dropDownToggle = (role) => {
  emit("dropDownToggle", role);
};
const handleSubmit = async (value) => {
  emit("finalSubmit", value);
};
</script>
