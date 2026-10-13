<template>
  <div class="w-full">
    <div v-if="loading" class="w-full flex">
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
      <div class="flex w-full animate-pulse">
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Name')"
          :data="name"
          :title="'Branch Name'"
          :placeholder="'Loading...'"
          :disabled="true"
          class="w-3/4 mr-2"
        />
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Code')"
          :data="code"
          :title="'Branch Code'"
          :placeholder="'Loading...'"
          :disabled="true"
          class="w-1/4 ml-2"
        />
      </div>
    </div>
  </div>
  <div v-else class="w-full flex">
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
        <MasterDropdownPicker :title="'Branch Name'" :list="branches" :selected="code" class="w-3/4 mr-2" @update="sendUpdate" />
        
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Code')"
          :data="code"
          :title="'Branch Code'"
          :placeholder="'KOD'"
          :disabled="true"
          class="w-1/4 ml-2"
          ref="textRef"
        />
      </div>
    </div>
  </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const { code, name } = defineProps(["code", "name"]);
const emit = defineEmits(["update", "update2"]);
const config = useRuntimeConfig();
const notification = useNotificationsStore();
const { add } = notification;

const textRef = ref(null);
const branches = ref([]);
const loading = ref(true);

function sendUpdate(value) {
  textRef.value.edit(value.value);
  emit('update', value.key, 'Branch_Name');
  emit('update', value.value, 'Branch_Code');
  emit('update2', value.key, 'Branch_Name');
  emit('update2', value.value, 'Code');
}

async function loadData() {
  const {data: branchesData, error: branchesError} = await useFetch(`${config.public.api}/api/master?noDevice=true`, {
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    }
  });
  if(branchesData.value && branchesData.value.statusCode === 200) {
    branches.value = branchesData.value.data.branches.map((item) => {
      return {
        key: item.Branch_Name,
        name: item.Branch_Name + " (" + item.Code + ")",
        value: item.Code
      }
    });
    loading.value = false;
  } else {
    add({ 
      title: `Error ${branchesError.value.statusCode}`,
      text: branchesError.value.statusMessage,
      color: 'red'
    });
  }
}
loadData();
</script>
