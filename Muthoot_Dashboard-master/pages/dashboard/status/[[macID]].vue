<template>
  <div class="w-full relative max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
    </div>
    <div v-else class="flex flex-col h-full w-full">
      <!-- Search Bar -->
      <StatusSearch @update="search($event)" />
      <!-- Filter -->
      <div class="w-full flex justify-between mt-4">
        <div class="flex">
            <div class=" bg-new-blue/10 text-white/80  rounded-lg flex mx-4 mb-4 items-center overflow-hidden" @click="filterRef.toggleView()" >
                <span class="py-2 px-6">1-{{ data.length }} of {{ data.length }}</span>
                <div class="h-full bg-new-blue/10 cursor-not-allowed text-new-blue/50 flex items-center px-1.5 border-r border-new-blue/30">
                  <SVGDown :size="'40'" class="rotate-90" />
                </div>
                <div class="h-full bg-new-blue/10 cursor-not-allowed text-new-blue/50 flex items-center px-1.5 ">
                  <SVGDown :size="'40'" class="-rotate-90" />
                </div>
            </div>
            <div class="px-4 py-2 bg-new-blue/10 text-white/80 hover:text-new-blue hover:bg-new-blue/20 rounded-lg cursor-pointer flex gap-2 mr-4 mb-4 items-center" @click="filterRef.toggleView()" >
                <SVGFilter :size="'20'" />
                <span>Filter</span>
            </div>
            <div class="px-4 py-2 bg-new-blue/10 text-white/80 hover:text-new-blue hover:bg-new-blue/20 rounded-lg flex gap-2 mb-4 items-center cursor-pointer" @click="loadData(!unregisteredToggle, true)" >
              <span>Show {{unregisteredToggle ? 'Registered' : 'Unregistered'}}</span>
            </div>
        </div>
        <div class="flex border border-new-blue/30 rounded px-4 mx-4 mb-4 items-center text-white gap-6">
          <div class="flex gap-1 items-center">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-m-green"></span>
            <span class="text-xs">Normal</span>
          </div>
          <div class="flex gap-1 items-center">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-m-yellow"></span>
            <span class="text-xs">Bypassed</span>
          </div>
          <div class="flex gap-1 items-center">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-m-red"></span>
            <span class="text-xs">Triggered</span>
          </div>
          <div class="flex gap-1 items-center">
            <span class="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
            <span class="text-xs">Disabled/Non-Functional</span>
          </div>
        </div>
      </div>
      <!-- Table -->
      <StatusMainTable :data="data" :macID="macID" />
      <CommonFilters
        ref="filterRef"
        :data="tempData"
        @update="(f) => filter(f)"
      />
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import { isVisibleOnStatusList } from "@/utils/statusVisibility";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Status`,
});

let gFilters = [];
let searchFilter = null;
const route = useRoute();
const { $io } = useNuxtApp();
const io = $io(localStorage.getItem("token"));
const router = useRouter();
const unregisteredToggle = ref(false);
const notification = useNotificationsStore();
const { add } = notification;

const loading = ref(true);
const filterRef = ref(null);
const macID = route.params.macID;
const data = ref([]);
let tempData = ref([]);

function filter(filters) {
  gFilters = filters;
  if (filters.length === 0) {
    if (searchFilter) {
      data.value = tempData.value.filter(searchFilter);
      return;
    } else {
      data.value = tempData.value;
      return;
    }
  }
  console.log(
    "main page",
    filters.map((i) => i.toString())
  );
  data.value = tempData.value.filter((item) => filters.every((f) => f(item)));
  if (searchFilter) {
    data.value = data.value.filter(searchFilter);
  }
}

function search(param) {
  if (param === "") {
    searchFilter = null;
    data.value = tempData.value;
    return;
  }
  if (is_numeric(param) && param.length === 4) {
    param = parseInt(param); // To remove the leading zeros
    param = param.toString();
  }
  searchFilter = (d) =>
    d.mac_id.toLowerCase().includes(param.toLowerCase()) ||
    d?.branch?.Branch_Name?.toLowerCase().includes(param.toLowerCase()) ||
    d?.branch?.Code?.toLowerCase().includes(param.toLowerCase());
  data.value = data.value.filter(searchFilter);
}

async function loadData(raw = false, unregistered=false) {
  loading.value = true;
  const { data: devices, error } = await useFetch(
    `${config.public.api}/api/status` + (raw ? '?raw=true' : ''),
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  if (devices.value.statusCode === 200) {
    data.value = devices.value.data;
  }
  if(unregistered){
    unregisteredToggle.value = !unregisteredToggle.value;
  }
  tempData.value = data.value;
  loading.value = false;
  filter(gFilters);
  return;
}
loadData();

io.connect();
io.on("connect", () => {
  // add({
  //   title: "Server Online",
  //   text: `Connected to server`,
  // });
});
io.on("disconnect", () => {
  // add({
  //   title: "Server Offline",
  //   text: `Disconnected from the server`,
  //   color: "red",
  // });
});
io.on("data", (newData) => {
  if (loading.value) return;
  // add({
  //   title: "Device Updated",
  //   text: `Data updated for with MacID ${newData.mac_id}`,
  // });
  // newData.Net_Con = "ethernet";
  const index = tempData.value.findIndex((d) => d.mac_id === newData.mac_id);
  const visible = isVisibleOnStatusList(newData, unregisteredToggle.value);
  if (!visible) {
    if (index !== -1) tempData.value.splice(index, 1);
  } else if (index === -1) {
    tempData.value.push(newData);
  } else {
    tempData.value[index] = newData;
  }
  filter(gFilters);
});
function is_numeric(val) {
  return +val == val;
}
</script>
