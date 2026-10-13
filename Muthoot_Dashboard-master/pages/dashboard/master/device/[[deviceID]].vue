<template>
  <div class="max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
    </div>
    <div
      v-else-if="index === 1"
      class="flex flex-col h-full w-full text-white gap-4 pb-16"
    >
      <div
        class="flex w-full px-16 py-8 justify-between items-center sticky top-0 z-10 backdrop-blur-lg"
      >
        <div class="flex flex-col">
          <span class="font-montserrat font-semibold text-2xl">Add Device</span>
          <span class="opacity-80 font-light"
            >Enter the Device information</span
          >
        </div>
        <div class="flex gap-6">
          <MasterProgress :index="1" />
          <div
            class="py-2 w-24 text-center bg-new-blue/80 text-new-black font-bold text-sm rounded-md cursor-pointer hover:bg-new-blue"
            @click="proceed()"
          >
            <span>Next</span>
          </div>
        </div>
      </div>
      <MasterDeviceBranchPicker
        :code="data.branch.Code"
        :name="data.branch.Branch_Name"
        @update="(value, config) => updateData(value, config, 'device')"
        @update2="(value, config) => updateData(value, config, 'branch')"
      />
      <MasterDeviceInfo
        :data="data"
        :statusReasons="statusReasons"
        @update="(value, config) => updateData(value, config, 'device')"
      />
      <MasterDeviceNetwork
        :data="data"
        :providers="providers"
        @update="(value, config) => updateData(value, config, 'device')"
      />
    </div>
    <div
      v-else-if="index === 2"
      class="flex flex-col h-full w-full text-white gap-4 pb-16"
    >
      <div
        class="flex w-full px-16 py-8 justify-between items-center sticky top-0 z-10 backdrop-blur-lg"
      >
        <div class="flex flex-col">
          <span class="font-montserrat font-semibold text-2xl"
            >Add Device Zones</span
          >
          <span class="opacity-80 font-light"
            >Set the Device Zone Information</span
          >
        </div>
        <div class="flex gap-6">
          <div
            class="py-2 w-24 text-center bg-new-blue/80 text-m-black font-bold text-sm rounded-md cursor-pointer hover:bg-new-blue"
            @click="index--"
          >
            <span>Previous</span>
          </div>
          <MasterProgress :index="2" />
          <div
            class="py-2 w-24 text-center bg-new-blue/80 text-m-black font-bold text-sm rounded-md cursor-pointer hover:bg-new-blue"
            @click="submitForm"
          >
            <SVGLoading class="mx-auto" v-if="submitting" />
            <span v-else>Submit</span>
          </div>
        </div>
      </div>
      <MasterDeviceBranch
        :code="data.branch.Code"
        :name="data.branch.Branch_Name"
        @update="(value, config) => updateData(value, config, 'device')"
      />
      <MasterZoneSelect
        :data="data"
        @update="(value) => updateData(value, 'Zones', 'device')"
      />
    </div>
    <CommonPopup ref="popup" />
    <div v-if="deleteOption">
      <MasterDeleteModal
        @dropDownToggle="deleteOption = false"
        @finalSubmit="submitFormFinal($event)"
      />
    </div>
  </div>
</template>
<script setup>
import zones from "~/data/zones";
import { useNotificationsStore } from "@/store/notifications";

definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Master`,
});
const route = useRoute();
const deviceID = route.params.deviceID;
const index = ref(1);
const router = useRouter();
const notification = useNotificationsStore();
const { add } = notification;
const config = useRuntimeConfig();
const deleteOption = ref(false);

const statusReasons = ref([]);
const providers = ref([]);
const loading = ref(true);
const submitting = ref(false);
const data = ref({
  branch: {
    Branch_Name: null,
    Code: null,
  },
  device: {
    Device_ID: null,
    Date_of_Installation: null,
    Warranty_Period: null,
    Hardware_Version: null,
    Software_Version: null,
    IP_Address: null,
    Modem_IP: null,
    WIFI_SSID: null,
    Password: null,
    GSM_Number: null,
    GSM_Provider: null,
    Branch_Name: null,
    Branch_Code: null,
    Zones: null,
    Current_Status: "Active",
    Status_Reason: "None",
  },
});
const popup = ref(null);

function updateData(value, config, section) {
  data.value[section][config] = value;
  console.log(data.value);
}

function proceed() {
  // let flag = false;
  // for (const key in data.value.device) {
  //   if (data.value.device[key] == null || data.value.device[key] == "") {
  //     popup.value.update(`Missing Detail: ` + key.split("_").join(" "), "red");
  //     flag = true;
  //     return;
  //   }
  // }
  index.value++;
  return;
}

async function submitFormFinal(value) {
  deleteOption.value = false;
  if (value.toLowerCase() === "yes") {
    //Call Delete Function
    const { data: response, error } = await useFetch(
      `${config.public.api}/api/device/${deviceID}`,
      {
        method: "DELETE",
        headers: {
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    if (response && response.value.statusCode === 200) {
      add({
        title: "Old Device Deleted",
        text: `Old Device Was Deleted Successfully.`,
      });
    } else {
      popup.value.update(
        `Error ${error.value.statusCode} : ${error.value.statusMessage}`,
        "red"
      );
    }
  }
  trueSubmit();
}

async function submitForm() {
  submitting.value = true;
  if (data.value.device.Device_ID.toLowerCase() !== deviceID.toLowerCase()) {
    deleteOption.value = true;
    return;
  } else {
    trueSubmit();
  }

  submitting.value = false;
}

async function trueSubmit() {
  const { data: response, error } = await useFetch(
    `${config.public.api}/api/device`,
    {
      method: "POST",
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data.value),
    }
  );
  if (response && response.value.statusCode === 200) {
    add({
      title: "Device Added",
      text: `Device Added Successfully. Redirecting...`,
    });
    setTimeout(() => {
      router.push("/dashboard/master");
    }, 2000);
  } else {
    popup.value.update(
      `Error ${error.value.statusCode} : ${error.value.statusMessage}`,
      "red"
    );
  }
}

async function loadData() {
  const { data: data2, error: error2 } = await useFetch(
    `${config.public.api}/api/branch/config/getDropDowns`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (data2.value.statusCode === 200) {
    statusReasons.value = data2.value.data.statusReasons || [];
    providers.value = data2.value.data.providers || [];
    console.log(data2.value.data);
  }
  if (!deviceID || deviceID === "new") {
    loading.value = false;
  } else {
    const { data: device, error } = await useFetch(
      `${config.public.api}/api/device/${deviceID}`,
      {
        headers: {
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    if (error.value) {
      if (error.value.statusCode === 404) {
        data.value.device.Device_ID = deviceID.toUpperCase();
        data.value.device.Zones = zones;
        loading.value = false;
      } else {
      }
      return;
    }
    if (device.value.statusCode === 200) {
      data.value.device = Object.assign(
        data.value.device,
        device.value.data.device
      );
      data.value.branch = Object.assign(
        data.value.branch,
        device.value.data.branch
      );
      loading.value = false;
    }
  }
  if (!data.value.device.Device_ID) {
    data.value.device.Device_ID = deviceID.toUpperCase();
  }
  if (!data.value.device.Zones) {
    data.value.device.Zones = zones;
  }
}
loadData();
</script>
