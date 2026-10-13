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
          <span class="font-montserrat font-semibold text-2xl">Add Branch</span>
          <span class="opacity-80 font-light"
            >Enter the branch information</span
          >
        </div>
        <div class="flex gap-6">
          <div
            class="py-2 w-24 text-center bg-new-blue/80 text-m-black font-bold text-sm rounded-md cursor-pointer hover:bg-new-blue"
            @click="submitForm"
          >
            <SVGLoading class="mx-auto" v-if="submitting" />
            <span v-else>Submit</span>
          </div>
        </div>
      </div>
      <MasterBranchInfo
        @update="(value, config) => updateData(value, config, 'branch')"
        :data="data"
        :macID="macID"
      />
      <MasterBranchAddress
        @update="(value, config) => updateData(value, config, 'branch')"
        :data="data"
      />
      <MasterBranchContact
        @update="(value, config) => updateData(value, config, 'branch')"
        :data="data"
      />
    </div>
    <CommonPopup ref="popup" />
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";

definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Master`,
});
const route = useRoute();
const code = route.params.code;
const index = ref(1);
const router = useRouter();
const notification = useNotificationsStore();
const { add } = notification;
const config = useRuntimeConfig();

const loading = ref(true);
const popup = ref(null);
const submitting = ref(false);
const data = ref({
  branch: {
    Branch_Name: null,
    Code: null,
    Region: null,
    Hub: null,
    Vertical: null,
    Zone: null,
    State: null,
    District: null,
    City: null,
    Building_Name: null,
    Pin_Code: null,
    Risk_Category: null,
    Branch_Locality: null,
    Post_Office: null,
    Mail_Address: null,
    Contact_Person: null,
    Mobile_Number: null,
    Branch_Land_Phone: null,
    Branch_Mobile: null,
    Current_Status: null,
    Support_Type: null,
  },
});

function updateData(value, config, section) {
  data.value[section][config] = value;
}

function proceed() {
  console.log(data.value.branch);
  let flag = false;
  for(let key in data.value.branch) {
    if(data.value.branch[key] == null || data.value.branch[key] == "") {
      popup.value.update(`Missing Detail: `+ key.split("_").join(" "), "red");
      flag = true;
      return false;
    }
  }
  return true;
}

async function submitForm() {
  submitting.value = true;
  if(!proceed()) {
    submitting.value = false;
    return;
  }
  const { data: response, error } = await useFetch(`${config.public.api}/api/branch`, {
    method: "POST",
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data.value),
  });
  if(response && response.value.statusCode === 200) {
    add({ 
      title: 'Branch Added',
      text: `Branch Added Successfully. Redirecting...`,
    });
    setTimeout(() => {
      router.push("/dashboard/master");
    }, 2000);
  } else {
    popup.value.update(`Error ${error.value.statusCode} : ${error.value.statusMessage}`, "red");
    submitting.value = false;
  }
}

async function loadData() {
  if (!code || code === "new") {
    loading.value = false;
  } else {
    const { data: device, error } = await useFetch(`${config.public.api}/api/branch/${code}`, {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      }
    });
    if (error.value) {
      if (popup.value)
        popup.value.update(
          `${error.value.statusCode} ${error.value.statusMessage}`,
          "red"
        );
      return;
    }
    if (device.value.statusCode === 200) {
      data.value.branch = Object.assign(data.value.branch,device.value.data);
      loading.value = false;
    }
  }
}
loadData();
</script>
