<template>
  <div class="h-full w-full max-w-screen-2xl mx-auto">
    <!-- Skeleton -->
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between w-28"
      ></div>
      <!-- Alarm & Connectivity -->
      <div class="flex h-36 w-full px-2 pb-4">
        <!-- Alarm -->
        <div class="w-1/2 mx-2 bg-new-blue/10 rounded-lg px-4 py-3"></div>
        <!-- Connectivity -->
        <div class="w-1/2 mx-2 bg-new-blue/10 rounded-lg"></div>
      </div>
      <div class="flex h-full w-full px-2 pb-4">
        <div class="flex flex-col h-full w-8/12 mx-2">
          <div class="w-full h-1/3 mb-4 bg-new-blue/10 rounded-lg"></div>
          <div class="w-full h-2/3 bg-new-blue/10 rounded-lg"></div>
        </div>
        <div class="w-4/12 mx-2 bg-new-blue/10 rounded-lg"></div>
      </div>
    </div>

    <!-- Original  -->
    <div v-else class="flex flex-col h-full w-full">
      <!-- Filter -->
      <div class="w-full flex mt-4">
        <div
          class="px-4 py-2 bg-new-blue/10 text-white/80 hover:text-new-blue hover:bg-new-blue/20 rounded-lg cursor-pointer flex gap-2 mx-4 mb-4 items-center"
          @click="filterRef.toggleView()"
        >
          <SVGFilter :size="'20'" />
          <span>Filter</span>
        </div>
      </div>
      <!-- Alarm & Connectivity -->
      <div class="flex w-full px-2 pb-4" @click="filtersComp.updateDrop">
        <!-- Alarm -->
        <div class="w-8/12 mx-2 bg-new-blue/10 border border-new-blue/30 rounded-lg px-4 py-3">
          <span class="font-montserrat font-semibold text-white/90"
            >Alarm Status</span
          >
          <div class="flex w-full">
            <div class="flex flex-col text-white min-w-fit mr-16">
              <span class="text-3xl pt-1 font-semibold">{{ data.length }}</span>
              <span class="text-xs">Total Alarms</span>
            </div>
            <ChartProgressBar
              class="cursor-pointer"
              :data="progress"
            />
          </div>
        </div>
        <!-- Connectivity -->
        <div class="w-4/12 mx-2 bg-new-blue/10 border border-new-blue/30 rounded-lg px-4 py-3 flex flex-col justify-between">
          <span class="font-montserrat font-semibold text-white/90"
            >Connectivity</span
          >
          <LandingConnectivity :data="data" />
        </div>
      </div>
      <!-- Tickets & Hardware -->
      <div class="ticket flex h-fit w-full px-2 pb-4" @click="filtersComp.updateDrop">
        <div class="flex flex-col w-8/12 mx-2">
          <div class="w-full mb-4 bg-new-blue/10 border border-new-blue/30 rounded-lg px-4 py-3">
            <span class="font-montserrat font-semibold text-white/90"
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
          <div class="w-full flex flex-1 flex-col bg-new-blue/10 border border-new-blue/30 rounded-lg px-4 py-3 justify-between">
            <span class="font-montserrat font-semibold text-white/90">Hardware Status</span>
            <!-- Operation Mode -->
            <LandingOperationMode :data="data" />
            <span class="font-montserrat font-semibold text-white/90 mt-4"
              >Offline Chart</span
            >
            <ChartArea />
          </div>
        </div>
        <div class="w-4/12 mx-2 bg-new-blue/10 border border-new-blue/30 rounded-lg flex flex-col px-4 py-3" >
          <span class="font-montserrat font-semibold text-white/90"
            >Ticket Raised</span
          >
          <div class="flex flex-col justify-around items-center h-full my-2">
            <ChartPieChart :pieData="pieData" />
            <ChartPieChartLabels :pieData="pieData" />
          </div>
        </div>
      </div>
      <CommonFilters ref="filterRef" :data="tempData" @update="(f) => filter(f)" />
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import Zones from "@/data/zones";
import { isVisibleOnStatusList } from "@/utils/statusVisibility";
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
const filterRef = ref(null);

const router = useRouter();
const loading = ref(true);

let data = ref([]);
let tempData = [];
const total = ref(0);
let zoneGauge = ref([]);
const progress = computed(() => [data.value.length, data.value.filter((d) => d.CMS_status === 'online').length]);
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
  // if (zones.value) zones.value.updateGauge();
}

function loadCharts() {
  for(let i = 1; i <= 16; i++) {
    zoneGauge.value[i-1] = data.value.filter((d) => d.CMS_status === 'online' && d[`Z${i}_bp`] !== '1' && d['ZONE_'+i] === 1).length || 0;
  }
  // zoneGauge.value[1] = data.value.filter((d) => d.ZONE_2 === 1).length || 0;
  // zoneGauge.value[2] = data.value.filter((d) => d.ZONE_3 === 1).length || 0;
  // zoneGauge.value[3] = data.value.filter((d) => d.ZONE_4 === 1).length || 0;
  // zoneGauge.value[4] = data.value.filter((d) => d.ZONE_5 === 1).length || 0;
  // zoneGauge.value[5] = data.value.filter((d) => d.ZONE_6 === 1).length || 0;
  // zoneGauge.value[6] = data.value.filter((d) => d.ZONE_7 === 1).length || 0;
  // zoneGauge.value[7] = data.value.filter((d) => d.ZONE_8 === 1).length || 0;
}


function filter(filters) {
  gFilters = filters;
  if (filters.length === 0) {
    data.value = tempData;
    total.value = data.value.length;
    loadCharts();
    // zones.value.updateGauge();
    return;
  }
  console.log(
    "main page",
    filters.map((i) => i.toString())
  );
  data.value = tempData.filter((item) => filters.every((f) => f(item)));
  loadCharts();
  // zones.value.updateGauge();
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
io.on("data", (newData) => {
  if (loading.value) return;
  const index = tempData.findIndex((d) => d.mac_id === newData.mac_id);
  if (!isVisibleOnStatusList(newData)) {
    if (index !== -1) tempData.splice(index, 1);
  } else if (index === -1) {
    tempData.push(newData);
  } else {
    tempData[index] = newData;
  }
  if (gFilters.length === 0) {
    data.value = tempData;
    total.value = data.value.length;
    loadCharts();
    // zones.value.updateGauge();
    return;
  }
  filter(gFilters);
});
</script>
