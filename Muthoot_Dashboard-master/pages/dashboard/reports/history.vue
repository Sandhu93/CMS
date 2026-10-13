<template>
  <div class="w-full max-w-screen-2xl mx-auto">
    <div class="flex flex-col h-full w-full">
      <ReportsSearch
        @update="search($event)"
        @modeChange="searchSelect = $event"
        ref="searchComp"
      />
      <div class="flex justify-between items-center">
        <div class="flex">
          <Filters
            @updateTimestamp="(value, type) => timeStamp(value, type)"
            ref="filtersComp"
          />
          <ReportsFiltersType @updateType="logType($event)" ref="filtersType" />
        </div>
        <button
          v-if="!loading"
          @click="exportData()"
          class="bg-new-blue/20 text-white py-2 px-4 mr-5 mt-4 h-fit rounded-md hover:bg-new-blue/80 transition-all ease-in-out duration-300 cursor-pointer"
        >
          {{ exportText }}
        </button>
      </div>
      <!-- Table -->
      <ReportsTable
        @click="
          () => {
            searchComp.updateSearchDrop();
            filtersComp.updateTimestampDrop();
            filtersType.updateTypeDrop();
          }
        "
        :dataPass="dataRef"
        :loading="loading"
      />
      <div v-if="!endOfLog" class="w-full flex flex-col items-center px-5">
        <div v-if="loadMoreDrop" class="animate-pulse w-full">
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
          <div class="w-full h-[50px] bg-new-blue/10 my-1"></div>
        </div>
        <div v-if="!loading">
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
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import Filters from "~/components/Reports/Filters.vue";
const config = useRuntimeConfig();
const exportText = ref("Export");
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Reports`,
});

const endOfLog = ref(false);
const pageNumber = ref(1);
const filterRequest = ref("?page[size]=25&page[number]=1");
const searchComp = ref();
const filtersComp = ref();
const filtersType = ref();
const router = useRoute();
const query = router.query;
if (query.MacID) {
  filterRequest.value += `&filter[macID][]=${encodeURIComponent(query.MacID)}`;
}
const searchSelect = ref("Branch Name");
const searchParam = ref("");
const timeStampParam = ref("");
const typeParam = ref("");
const loading = ref(true);
const dataRef = ref([]);
const branches = ref([]);
const loadMoreDrop = ref(false);
let tempData = [];

async function loadMore() {
  loadMoreDrop.value = !loadMoreDrop.value;
  pageNumber.value++;
  filterRequest.value = `?page[size]=25&page[number]=${pageNumber.value}`;
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/history${
      filterRequest.value +
      searchParam.value +
      timeStampParam.value +
      typeParam.value
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
  loadMoreDrop.value = !loadMoreDrop.value;
  if (data.value.data.length < 50) {
    endOfLog.value = true;
    return;
  }
  dataRef.value = [...dataRef.value, ...data.value.data];
}

async function logType(value) {
  typeParam.value = value === `All` ? '' : `&filter[type][]=${value}`;
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/history${
      filterRequest.value +
      searchParam.value +
      timeStampParam.value +
      typeParam.value
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
      filterRequest.value +
      searchParam.value +
      timeStampParam.value +
      typeParam.value
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
  if (param == "" && timeStampParam.value === "" && typeParam.value === "") {
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
  loading.value = true;
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/history${
      filterRequest.value +
      searchParam.value +
      timeStampParam.value +
      typeParam.value
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
  loading.value = false;
}
async function loadData() {
  const { data, error } = await useFetch(
    `${config.public.api}/api/reports/history${filterRequest.value}`,
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
    tempData = dataRef.value;
    console.log(dataRef.value);
  }
  //   tempData = data.value;
  loading.value = false;
  return;
}

async function exportData() {
  if (exportText.value === "Exporting...") return;
  exportText.value = "Exporting...";
  const response = await fetch(
    `${config.public.api}/api/reports/history/exportData${
      filterRequest.value +
      searchParam.value +
      timeStampParam.value +
      typeParam.value
    }`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    if (response.status === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.location.assign(url);
  exportText.value = "Export";
  return;
}

loadData();
</script>
