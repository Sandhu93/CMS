<template>
  <div class="w-full max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full">
      <!-- Table -->
      <div class="flex justify-between mr-4 mt-6 mb-2 ml-6">
        <div class="flex text-white gap-32">
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Today's Date</span
            >
            <span class="font-semibold text-xl">
              {{
                new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Check In's</span
            >
            <div class="h-6 w-12 bg-new-blue/10 animate-pulse rounded"></div>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Check Out's</span
            >
            <div class="h-6 w-12 bg-new-blue/10 animate-pulse rounded"></div>
          </div>
        </div>
        <button
          class="px-8 py-3 bg-new-blue rounded-sm opacity-50 cursor-not-allowed"
        >
          Download CSV
        </button>
      </div>
      <div class="flex justify-end gap-5 mx-4"></div>
      <div class="w-full flex flex-col items-center px-5 mt-4">
        <div class="animate-pulse w-full">
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col h-full w-full">
      <!-- Table -->
      <div class="flex justify-between mr-4 mt-6 mb-2 ml-6">
        <div class="flex text-white gap-32">
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Today's Date</span
            >
            <span class="font-semibold text-xl">
              {{
                new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Check In's</span
            >
            <span class="font-semibold text-xl">
              {{ counterData.checkInTotal }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="font-semibold uppercase text-sm opacity-60"
              >Check Out's</span
            >
            <span class="font-semibold text-xl">
              {{ counterData.checkOutTotal }}
            </span>
          </div>
        </div>
        <button class="px-8 py-3 bg-new-blue rounded-sm" @click="downloadCSV()">
          Download CSV
        </button>
      </div>
      <ReportsSearch
        @update="search($event)"
        @modeChange="searchSelect = $event"
        ref="searchComp"
      />
      <Filters
        @updateTimestamp="(value, type) => timeStamp(value, type)"
        ref="filtersComp"
      />
      <div class="flex justify-end gap-5 mx-4"></div>
      <ReportsAttendanceTable :dataPass="dataRef" />
      <div v-if="!endOfLog" class="w-full flex flex-col items-center px-5">
        <div v-if="loadMoreDrop" class="animate-pulse w-full">
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
        </div>
        <h1
          @click="loadMore"
          class="h-[50px] text-white text-xl mt-10 cursor-pointer flex justify-center items-center rounded-xl pb-20"
        >
          Load More
          <SVGDown
            :class="`${
              loadMoreDrop ? 'rotate-180' : ''
            } transition-all ease-in-out duration-500`"
          />
        </h1>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import Filters from "~/components/Reports/Filters.vue";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Reports`,
});
const loading = ref(true);
const dataRef = ref([]);
const filterRequest = ref("?page[size]=10&page[number]=1");
const branches = ref([]);
const loadMoreDrop = ref(false);
const endOfLog = ref(false);
const pageNumber = ref(1);
const counterData = ref({});
const searchComp = ref();
const filtersComp = ref();
const searchSelect = ref("Branch Name");
const searchParam = ref("");
const timeStampParam = ref("");
let tempData = [];

async function timeStamp(value, type) {
  if (type === "Custom") {
    timeStampParam.value = `&filter[timestamp][]=${value.start}&filter[timestamp][]=${value.end}`;
    console.log(timeStampParam.value);
  } else if (type === "All Time") {
    timeStampParam.value = "";
    console.log(timeStampParam.value);
  } else {
    timeStampParam.value = `&filter[timestamp][]=${value}`;
    console.log(timeStampParam.value);
  }
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/history${
      filterRequest.value + searchParam.value + timeStampParam.value
    }`,
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
  dataRef.value = data.value.data;
  console.log(data.value.data);
}

async function search(param) {
  searchParam.value = "";
  if (param == "") {
    dataRef.value = tempData;
    return;
  }
  console.log(searchSelect.value);
  param = param.trim().split(",");
  if (searchSelect.value === "Branch Name") {
    for (let p of param) {
      searchParam.value += `&filter[BranchName][]=${encodeURIComponent(p)}`;
    }
  }
  if (searchSelect.value === "Branch Code") {
    for (let p of param) {
      searchParam.value += `&filter[BranchCode][]=${encodeURIComponent(p)}`;
    }
  }
  if (searchSelect.value === "Mac Id") {
    for (let p of param) {
      searchParam.value += `&filter[macID][]=${encodeURIComponent(p)}`;
    }
  }
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/attendance${
      filterRequest.value + searchParam.value + timeStampParam.value
    }`,
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
  // console.log(filterRequest.value + searchParam.value);
  console.log(data.value);
  dataRef.value = data.value.data;
}

async function loadMore() {
  loadMoreDrop.value = !loadMoreDrop.value;
  pageNumber.value++;
  filterRequest.value = `?page[size]=10&page[number]=${pageNumber.value}`;
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/attendance${filterRequest.value}`,
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
  loadMoreDrop.value = !loadMoreDrop.value;
  if (data.value.data.length < 10) {
    endOfLog.value = true;
    return;
  }
  console.log(dataRef.value, data.value.data);
  dataRef.value = [...dataRef.value, ...data.value.data];
}

async function loadData() {
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/attendance${filterRequest.value}`,
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
  if (data.value.statusCode === 200) {
    dataRef.value = data.value.data;
    tempData = data.value.data;
  }
  const { data: countData, error2 } = await useFetch(
    `${config.public.api}/api/reports/attendance/counters`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error2 && error2.value) {
    if (error2.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error2.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  if (countData.value.statusCode === 200) {
    counterData.value = countData.value.data;
  }
  //   tempData = data.value;
  loading.value = false;
  return;
}
async function downloadCSV() {
  window.location.href = `${
    config.public.api
  }/api/reports/attendance/download?token=${localStorage.getItem("token")}`;
  // try {
  //   const { data, error } = await useFetch(
  //     `${config.public.api}/api/reports/attendance/download`,
  //     {
  //       headers: {
  //         authorization: `${localStorage.getItem("token")}`,
  //       },
  //     }
  //   );
  //   if (error.value) {
  //     if (error.value.statusCode === 401) {
  //       setTimeout(() => {
  //         router.push("/");
  //       }, 5000);
  //     }
  //     console.log(error.value);
  //     return;
  //   }
  // } catch (error) {
  //   setTimeout(() => {
  //     router.push("/");
  //   }, 5000);
  // }
}
loadData();
</script>
