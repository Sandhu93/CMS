<template>
  <div class="h-full w-full">
    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-m-black-light m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
      <!-- Alarm & Connectivity -->
      <div class="flex h-36 w-full px-2 pb-4">
        <!-- Alarm -->
        <div class="w-1/2 mx-2 bg-m-black-light rounded-lg px-4 py-3"></div>
        <!-- Connectivity -->
        <div class="w-1/2 mx-2 bg-m-black-light rounded-lg"></div>
      </div>
      <div class="flex h-full w-full px-2 pb-4">
        <div class="flex flex-col h-full w-8/12 mx-2">
          <div class="w-full h-1/2 mb-4 bg-m-black-light rounded-lg"></div>
          <div class="w-full h-1/2 bg-m-black-light rounded-lg"></div>
        </div>
        <div class="w-4/12 mx-2 bg-m-black-light rounded-lg"></div>
      </div>
    </div>

    <!-- Original  -->
    <div v-else class="flex flex-col max-h-screen w-full">
      <!-- Filter -->
      <LandingFilters
        @updateData="(filters) => filterFunc(filters)"
        ref="filtersComp"
      />
      <!-- Alarm & Connectivity -->
      <div class="flex w-full px-2 pb-4" @click="filtersComp.updateDrop">
        <!-- Alarm -->
        <div class="w-8/12 mx-2 bg-m-black-light rounded-lg px-4 py-3">
          <span class="font-montserrat font-semibold text-white/60"
            >Alarm Status</span
          >
          <div class="flex w-full">
            <div class="flex flex-col text-white min-w-fit mr-16">
              <span class="text-3xl pt-1 font-semibold">{{ data.length }}</span>
              <span class="text-xs">Total Alarms</span>
            </div>
            <ChartProgressBar
              class="cursor-pointer"
              :data="[
                data.length,
                data.filter((d) => d.CMS_status === 'online').length,
              ]"
            />
          </div>
        </div>
        <!-- Connectivity -->
        <div
          class="w-4/12 mx-2 bg-m-black-light rounded-lg px-4 py-3 flex flex-col justify-between"
        >
          <span class="font-montserrat font-semibold text-white/60"
            >Connectivity</span
          >
          <LandingConnectivity :data="data" />
        </div>
      </div>
      <!-- Tickets & Hardware -->
      <div
        class="ticket flex h-full w-full px-2 pb-4"
        @click="filtersComp.updateDrop"
      >
        <div class="flex flex-col h-full w-8/12 mx-2">
          <div class="w-full h-1/3 mb-4 bg-m-black-light rounded-lg px-4 py-3">
            <span class="font-montserrat font-semibold text-white/60"
              >Zone Issues</span
            >
            <LandingZoneIssuesGauges
              :zoneGauge="zoneGauge"
              :total="data.length"
              ref="zones"
              @click="() => modalDropdown()"
              @sendModalData="(configName) => changeModalData(configName)"
              class="cursor-pointer"
            />
          </div>
          <div class="w-full h-2/3 bg-m-black-light rounded-lg px-4 py-3">
            <span class="font-montserrat font-semibold text-white/60"
              >Hardware Status</span
            >
            <!-- Operation Mode -->
            <LandingOperationMode :data="data" />
            <ChartArea />
          </div>
        </div>
        <div
          class="w-4/12 mx-2 bg-m-black-light rounded-lg flex flex-col px-4 py-3"
        >
          <span class="font-montserrat font-semibold text-white/60"
            >Ticket Raised</span
          >
          <div class="flex flex-col justify-around items-center h-full my-2">
            <ChartPieChart :pieData="pieData" />
            <ChartPieChartLabels :pieData="pieData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Alerts`,
});
const { $io } = useNuxtApp();
const io = $io(localStorage.getItem("token"));
const notification = useNotificationsStore();
const { add } = notification;
const filtersComp = ref();

const router = useRouter();
const loading = ref(true);

let data = ref([]);
let tempData = [];
const total = ref(0);
let zoneGauge = ref([]);
// let connectivityData = ref([0,0,0]);
let gFilters = [];
let zones = ref(null);
let showModal = ref(false);
let modalData = ref(null);
let pieData = ref([30, 40, 20, 10, 40, 50]);
async function loadData() {
  const {
    data: items,
    refresh,
    error,
  } = await useFetch(`${config.public.api}/api/status`, {
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    add({
      title: `Fetch Error ${error.value.statusCode}`,
      text: error.value.statusMessage,
      color: "red",
    });
    return;
  }
  if (items.value.statusCode === 200) {
    data.value = items.value.data;
  }
  tempData = data.value;
  total.value = data.value.length || 0;
  loadCharts();
  loading.value = false;
  if (zones.value) zones.value.updateGauge();
}
function loadCharts() {
  zoneGauge.value[0] = data.value.filter((d) => d.ZONE_1 === 1).length || 0;
  zoneGauge.value[1] = data.value.filter((d) => d.ZONE_2 === 1).length || 0;
  zoneGauge.value[2] = data.value.filter((d) => d.ZONE_3 === 1).length || 0;
  zoneGauge.value[3] = data.value.filter((d) => d.ZONE_4 === 1).length || 0;
  zoneGauge.value[4] = data.value.filter((d) => d.ZONE_5 === 1).length || 0;
  zoneGauge.value[5] = data.value.filter((d) => d.ZONE_6 === 1).length || 0;
  zoneGauge.value[6] = data.value.filter((d) => d.ZONE_7 === 1).length || 0;
  zoneGauge.value[7] = data.value.filter((d) => d.ZONE_8 === 1).length || 0;
}
function filterFunc(filters) {
  console.log(filters);
  gFilters = filters;
  if (filters.length === 0) {
    data.value = tempData;
    total.value = data.value.length;
    loadCharts();
    zones.value.updateGauge();
    return;
  }
  let tempData2 = [];
  for (const filter of filters) {
    let filterFuncFinal = findFilterFunc(filter);
    console.log(filterFuncFinal);
    tempData2.push(...tempData.filter(filterFuncFinal));
  }
  data.value = tempData2.filter(
    (v, i, a) => a.findIndex((v2) => v2.mac_id === v.mac_id) === i
  );
  loadCharts();
  zones.value.updateGauge();
}

function findFilterFunc(config) {
  let filterFinal = "";
  switch (config) {
    case "wifi":
      filterFinal = (device) => device.Net_Con === "wifi";
      return filterFinal;
    case "ethernet":
      filterFinal = (device) => device.Net_Con === "ethernet";
      return filterFinal;
    case "cell":
      filterFinal = (device) => device.Net_Con === "cellular";
      return filterFinal;
    case "online":
      filterFinal = (device) => device.CMS_status === "online";
      return filterFinal;
    case "offline":
      filterFinal = (device) => device.CMS_status === "offline";
      return filterFinal;
    default:
      break;
  }
}

function modalDropdown() {
  showModal.value = !showModal.value;
  document.getElementsByTagName("HTML")[0].classList.toggle("overflow-hidden");
}
function changeModalData(configName) {
  modalData.value = data.value.filter((d) => d[configName] === 1) || [];
  modalData.value = modalData.value.map(
    (item) => item.device.Branch_name || "Unknown"
  );
  console.log(modalData.value);
}
loadData();
io.connect();
// io.on("connect", () => {
//   add({
//     title: "Server Online",
//     text: `Connected to server`,
//   });
// });
// io.on("disconnect", () => {
//   add({
//     title: "Server Offline",
//     text: `Disconnected from the server`,
//     color: "red",
//   });
// });
io.on("data", (newData) => {
  if (loading.value) return;
  // add({
  //   title: 'Device Updated',
  //   text: `Data updated for with MacID ${newData.mac_id}`,
  //   });
  // newData.Net_Con = "ethernet";
  tempData[tempData.findIndex((d) => d.mac_id === newData.mac_id)] = newData;
  if (gFilters.length === 0) {
    data.value = tempData;
    total.value = data.value.length;
    loadCharts();
    if (zones.value) zones.value.updateGauge();
    return;
  }
  let tempData2 = [];
  for (const filter of gFilters) {
    tempData2.push(...tempData.filter(filter));
  }
  data.value = tempData2.filter(
    (v, i, a) => a.findIndex((v2) => v2.mac_id === v.mac_id) === i
  );
  loadCharts();
  if (zones.value) zones.value.updateGauge();
});
</script>
