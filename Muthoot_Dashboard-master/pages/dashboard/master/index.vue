<template>
  <div class="h-full w-full max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex h-full w-full animate-pulse">
      <div class="w-1/2">
        <!-- Title Button -->
        <div class="flex h-14 w-full px-8 pt-4 justify-between">
          <!-- Alarm -->
          <div class="w-1/4 mx-2 bg-new-blue/10 rounded-lg px-4 py-3"></div>
          <!-- Connectivity -->
          <div class="w-24 mx-2 bg-new-blue/10 rounded-lg"></div>
        </div>
        <!-- Users -->
        <div
          class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
        ></div>
        <div
          class="flex h-14 bg-new-blue/10 mx-4 mb-4 rounded-lg items-center pl-4 pr-8 justify-between"
        ></div>
      </div>
      <div class="w-1/2">
        <!-- Title Button -->
        <div class="flex h-14 w-full px-8 pt-4 justify-between">
          <!-- Alarm -->
          <div class="w-1/4 mx-2 bg-new-blue/10 rounded-lg px-4 py-3"></div>
          <!-- Connectivity -->
          <div class="w-24 mx-2 bg-new-blue/10 rounded-lg"></div>
        </div>
        <!-- Users -->
        <div
          class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
        ></div>
        <div
          class="flex h-14 bg-new-blue/10 mx-4 mb-4 rounded-lg items-center pl-4 pr-8 justify-between"
        ></div>
      </div>
    </div>
    <div v-else class="h-full w-full flex">
      <!-- Devices -->
      <div class="w-1/2 h-full overflow-y-auto relative mr-4">
        <div
          class="flex w-full justify-between pl-8 pr-4 pt-8 pb-4 text-white sticky top-0 bg backdrop-blur-lg rounded-b-lg"
        >
          <h1 class="text-2xl font-semibold">Devices</h1>
          <div class="flex gap-4">
            <div
              class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              @click="router.push('/dashboard/master/device')"
            >
              <SVGPlus class="text-white" />
              <span class="font-medium">Add Device</span>
            </div>
          </div>
        </div>
        <div class="w-full flex gap-5 items-center">
          <div class="h-full bg-white/10 rounded flex items-center w-1/2 ml-4">
            <SVGSearch class="text-white/60 ml-2" :size="'28'" />
            <input
              class="flex-1 h-full bg-transparent outline-none rounded-lg p-4 pl-3 text-white text-sm"
              placeholder="Search a MacID"
              @input="deviceSearcher"
              v-model="deviceSearch"
            />
          </div>
          <MasterDropdownPickerCustomStatus
            :title="'Status'"
            :list="activeORInactive"
            :selected="deviceStatusFilter"
            @update="deviceActiveInactive($event.value)"
            class="w-1/2 h-full"
          />
        </div>
        <div
          class="flex flex-col px-4 py-8 rounded-lg m-4 bg-new-blue/10 gap-4 mt-4"
        >
          <div
            v-for="(device, i) in devices"
            :key="i"
            class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center justify-between"
          >
            <div class="flex gap-4 items-center">
              <span class="font-medium text-white">{{ i + 1 }}</span>
              <div class="flex gap-2 items-center">
                <span class="font-medium text-white text-lg uppercase">{{
                  device.Device_ID
                }}</span>
                <span class="font-light text-white/80 text-sm">{{
                  branchLocator(device)
                }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <SVGEditUsers
                class="text-white/60 cursor-pointer hover:text-white"
                @click="
                  router.push('/dashboard/master/device/' + device.Device_ID)
                "
              />
              <SVGDelete
                class="text-white/60 cursor-pointer hover:text-white"
                @click="initiateDelete('device', device)"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Branches -->
      <div class="w-1/2 h-full overflow-y-auto relative">
        <div
          class="flex w-full justify-between pr-8 pl-4 pt-8 pb-4 text-white sticky top-0 backdrop-blur-lg rounded-b-lg"
        >
          <h1 class="text-2xl font-semibold">Branches</h1>
          <div class="flex gap-4">
            <div
              class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              @click="router.push('/dashboard/master/branch')"
            >
              <SVGPlus class="text-white" />
              <span class="font-medium">Add Branch</span>
            </div>
          </div>
        </div>
        <div class="w-full flex gap-5 items-center">
          <div class="h-full bg-white/10 rounded flex items-center w-1/2 ml-4">
            <SVGSearch class="text-white/60 ml-2" :size="'28'" />
            <input
              class="flex-1 h-full bg-transparent outline-none rounded-lg p-4 pl-3 text-white text-sm"
              placeholder="Search a Branch"
              @input="branchSearcher"
              v-model="branchSearch"
            />
          </div>
          <MasterDropdownPickerCustomStatus
            :title="'Status'"
            :list="activeORInactive"
            :selected="branchStatusFilter"
            @update="branchActiveInactive($event.value)"
            class="w-1/2 h-full"
          />
        </div>
        <div
          class="flex flex-col px-4 py-8 rounded-lg m-4 bg-new-blue/10 gap-4 mt-4"
        >
          <div
            v-for="(branch, i) in branches"
            :key="i"
            class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center justify-between"
          >
            <div class="flex gap-4 items-center">
              <span class="font-medium text-white">{{ i + 1 }}</span>
              <div class="flex gap-2 items-center">
                <span class="font-medium text-white text-lg"
                  >{{ branch.Branch_Name }}, {{ branch.Code }}</span
                >
                <span class="font-light text-white/80 text-sm"
                  >{{
                    branch.Region
                      ? branch.Region + (branch.Hub ? ", " : "")
                      : ""
                  }}{{ branch.Hub || "" }}</span
                >
              </div>
            </div>
            <div class="flex items-center gap-3">
              <SVGEditUsers
                class="text-white/60 cursor-pointer hover:text-white"
                @click="router.push('/dashboard/master/branch/' + branch.Code)"
              />
              <SVGDelete
                class="text-white/60 cursor-pointer hover:text-white"
                @click="initiateDelete('branch', branch)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <MasterDeleteModal
      v-if="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      @dropDownToggle="showDeleteModal = false"
      @finalSubmit="handleDeleteConfirm"
    />
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Master`,
});
const loading = ref(true);
const notifications = useNotificationsStore();
const router = useRouter();
const { add } = notifications;
const deviceSearch = ref(null);
const branchSearch = ref(null);
const tempData = ref({});
const devices = ref([]);
const branches = ref([]);
const deviceStatusFilter = ref("Active");
const branchStatusFilter = ref("Active");
const activeORInactive = [
  {
    value: "Active",
    name: "Active",
  },
  {
    value: "Inactive",
    name: "Inactive",
  },
];

function deviceActiveInactive(val) {
  deviceStatusFilter.value = val;
  if (deviceStatusFilter.value === "Active") {
    devices.value = tempData.value.devices.filter(
      (d) =>
        d.Current_Status === "Active" ||
        Object.hasOwnProperty.call(d, "Current_Status") === false
    );
  } else if (deviceStatusFilter.value === "Inactive") {
    devices.value = tempData.value.devices.filter(
      (d) => d.Current_Status === "Inactive"
    );
  }
}

function branchActiveInactive(val) {
  branchStatusFilter.value = val;
  if (branchStatusFilter.value === "Active") {
    branches.value = tempData.value.branches.filter(
      (d) => d.Current_Status === "Active"
    );
  } else if (branchStatusFilter.value === "Inactive") {
    branches.value = tempData.value.branches.filter(
      (d) => d.Current_Status === "Inactive"
    );
  }
}

const showDeleteModal = ref(false);
const deleteModalTitle = ref("");
const deleteModalMessage = ref("");
const itemToDelete = ref(null);

function initiateDelete(type, item) {
  itemToDelete.value = { type, data: item };
  
  if (type === 'device') {
    deleteModalTitle.value = `Delete Device ${item.Device_ID}`;
    if (item.Branch_Code) {
      deleteModalMessage.value = `This device is currently assigned to a branch. Are you sure you want to delete it?`;
    } else {
      deleteModalMessage.value = `Are you sure you want to delete this device?`;
    }
  } else if (type === 'branch') {
    deleteModalTitle.value = `Delete Branch ${item.Code}`;
    const linkedDevices = tempData.value.devices.filter(d => d.Branch_Code === item.Code).length;
    if (linkedDevices > 0) {
      deleteModalMessage.value = `This branch is linked to ${linkedDevices} device(s). Proceeding will unlink them. Are you sure?`;
    } else {
      deleteModalMessage.value = `Are you sure you want to delete this branch?`;
    }
  }
  
  showDeleteModal.value = true;
}

async function handleDeleteConfirm(value) {
  showDeleteModal.value = false;
  if (value.toLowerCase() === 'yes' && itemToDelete.value) {
    const { type, data } = itemToDelete.value;
    const url = type === 'device' 
      ? `${config.public.api}/api/device/${data.Device_ID}`
      : `${config.public.api}/api/branch/${data.Code}`;
      
    const { data: response, error } = await useFetch(url, {
      method: "DELETE",
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    });

    if (response && response.value.statusCode === 200) {
      add({
        title: `${type === 'device' ? 'Device' : 'Branch'} Deleted`,
        text: `The ${type} was successfully deleted.`,
      });
      // Refresh data
      await loadData();
    } else {
      add({
        title: "Error",
        text: error.value?.statusMessage || "Failed to delete",
        color: "red"
      });
    }
  }
  itemToDelete.value = null;
}

function deviceSearcher() {
  if (deviceSearch.value === "") {
    devices.value = tempData.value.devices;
    return;
  }
  devices.value = tempData.value.devices.filter((d) =>
    d.Device_ID.toLowerCase().includes(deviceSearch.value.toLowerCase())
  );
}
function branchSearcher() {
  if (branchSearch.value === "") {
    branches.value = tempData.value.branches;
    return;
  }
  branches.value = tempData.value.branches.filter((d) => {
    let tempD = branchSearch.value.toLowerCase();
    return (
      d.Branch_Name.toLowerCase().includes(tempD) || d.Code.includes(tempD)
    );
  });
}

function branchLocator(device) {
  const branch = tempData.value.branches.find(
    (i) => i.Code === device.Branch_Code
  );
  if (branch) {
    return `${branch.Branch_Name} Branch`;
  }
  return "Branch Not Assigned";
}

async function loadData() {
  const { data, error } = await useFetch(`${config.public.api}/api/master`, {
    headers: {
      Authorization: `${localStorage.getItem("token")}`,
    },
  });
  if (error.value) {
    add({
      title: `Error ${error.value.statusCode}`,
      text: error.value.statusMessage,
      color: "red",
    });
    return;
  }
  if (data.value.statusCode === 200) {
    tempData.value = data.value.data;
    devices.value = data.value.data.devices;
    console.log(data.value.data.branches);
    devices.value = tempData.value.devices.filter(
      (d) =>
        d.Current_Status === "Active" ||
        Object.hasOwnProperty.call(d, "Current_Status") === false
    );
    branches.value = data.value.data.branches;
    branches.value = data.value.data.branches.filter(
      (d) => d.Current_Status === "Active"
    );
    loading.value = false;
  }
}
loadData();
</script>
