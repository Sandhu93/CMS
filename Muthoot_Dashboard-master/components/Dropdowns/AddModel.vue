<template>
  <div
    class="absolute top-0 left-0 w-screen min-h-screen flex justify-center items-center bg-black/60"
  >
    <div
      class="w-[450px] px-6 py-8 text-white font-quicksand justify-around flex flex-col gap-4 bg-m-black-light rounded-lg relative"
    >
      <div class="flex flex-col">
        <span class="font-montserrat font-semibold text-2xl">Confirm</span>
        <span>You are about to add a new dropdown</span>
        <input
          v-model="dropDownItem"
          class="bg-white/10 rounded px-4 py-2"
          type="text"
          placeholder="Enter the dropdown name"
        />
      </div>
      <div class="flex mx-auto gap-6">
        <button
          @click="
            () => {
              if (dropDownItem !== '') {
                emit('addItem', dropDownItem);
              }
            }
          "
          class="bg-m-red font-bold text-lg px-6 py-3 rounded w-[150px]"
        >
          Yes
        </button>
        <button
          @click="emit('cancelAdd')"
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
const dropDownItem = ref("");
const emit = defineEmits(["addItem", "cancelAdd"]);
const handleSubmit = async () => {};
</script>
