<template>
  <div
    class="absolute top-0 left-0 w-screen min-h-screen flex justify-center items-center bg-black/60"
  >
    <div
      class="w-[450px] px-6 py-8 text-white font-quicksand justify-around flex flex-col gap-4 bg-m-black-light rounded-lg relative"
    >
      <div class="flex flex-col">
        <span class="font-montserrat font-semibold text-2xl">Confirm</span>
        <span>You are about to delete the role {{ selectedRole.name }}</span>
      </div>
      <div class="flex mx-auto gap-6">
        <button
          @click="handleSubmit"
          class="bg-m-red font-bold text-lg px-6 py-3 rounded w-[150px]"
        >
          Yes
        </button>
        <button
          @click="dropDownToggle"
          class="bg-white/10 font-bold text-lg px-6 py-3 rounded w-[150px]"
        >
          No
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationsStore } from '~/store/notifications';
const config = useRuntimeConfig();
const loading = ref(false);
const notification = useNotificationsStore();
const { add } = notification;
const { selectedRole } = defineProps(["selectedRole"]);
const emit = defineEmits(["dropDownToggle"]);
const dropDownToggle = (role) => {
  emit("dropDownToggle", role);
};
const handleSubmit = async () => {
  loading.value = true;
  const { data, error } = await useFetch(`${config.public.api}/api/roles`, {
    method: "DELETE",
    body: JSON.stringify(selectedRole),
    headers: {
      "Content-Type": "application/json",
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  if (error.value) {
    add({
      title: "Error " + error.value.statusCode,
      text: error.value.message,
      color: "red",
    });
    loading.value = false;
    return;
  }else{
    add({
      title: "Success",
      text: "Role deleted successfully",
      color: "green",
    });
    dropDownToggle(selectedRole);
  }
  loading.value = false;
  // console.log(data.value);
  // console.log(error.value);
};
</script>
