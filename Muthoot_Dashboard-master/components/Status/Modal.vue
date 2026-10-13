<template>
  <div
    class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center"
  >
  <div class="w-full h-full flex justify-center items-center max-w-screen-2xl">
  <div class="absolute h-screen w-screen top-0 left-0 bg-new-black/50 cursor-pointer"
      @click="emit('dropDown')"
    ></div>
  <div
      v-if="loading"
      :class="` w-[90%] z-20 h-[628px] p-5  bg-new-blue bg-opacity-[0.15] backdrop-blur-lg flex flex-col rounded-lg gap-4`"
    >
    <div class="bg-white/10 rounded-lg p-4 h-[104px] flex mx-2 animate-pulse">
    </div>
     <div class="w-full flex h-full animate-pulse">
        <div class="w-1/4">
          <!-- ALARM PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-full">
          </div>
        </div>
        <div class="w-1/4">
          <!-- NETWORK PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-full">
          </div>
        </div>
        <div class="w-2/4">
          <!-- ZONE PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-full">
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      :class="` w-[90%] z-20 h-[628px] p-5  bg-new-blue bg-opacity-[0.15] backdrop-blur-lg flex flex-col rounded-lg gap-4`"
    >
    <div class=" border-2 border-white/10 rounded-lg p-4 flex mx-2">
      <span class="px-4 pt-4 pb-2 font-semibold text-lg font-montserrat">Branch Info</span>
      <div class="flex gap-4">
        <div>
          <div class="mx-4 gap-3 flex items-end">
          <span class="font-montserrat">Branch Name:</span>
          <span class="text-sm opacity-80">{{
            data.branch?.Branch_Name || "Unknown"
          }}</span>
          </div>
          <div class="mx-4 gap-3 flex items-end">
            <span class="font-montserrat">Branch Code:</span>
            <span class="text-sm opacity-80">{{
              data.branch?.Code || "Unknown"
            }}</span>
          </div>
          
           <div class="mx-4 gap-3 flex items-start">
            <span class="font-montserrat">Branch Address:</span>
            <div class="flex flex-col">
              <span class="text-sm opacity-80">{{
                data.branch ? `${data.branch.Building_Name},` : "Unknown"
              }}</span>
              <span class="text-sm opacity-80">{{
                data.branch ? `${data.branch.Post_Office ? data.branch.Post_Office + ', ' : ''}${data.branch.District ? data.branch.District + ', ' : ''}${data.branch.State ? data.branch.State + ', ' : ''}${data.branch.Pin_Code}` : "Unknown"
              }}</span>
            </div>
          </div>
        </div>
        <!-- Branch_Name: null, -->
      <!-- Code: null,
      Region: null,
      Hub: null,
      Vertical: null,
      Zone: null,
      State: null,
      District: null,
      City: null,
      Building_Name: null,
      Pin_Code: null,
      Post_Office: null,
      Mail_Address: null,
      Contact_Person: null,
      Mobile_Number: null,
      Branch_Land_Phone: null,
      Branch_Mobile: null, -->
        <div>
          <div class="mx-4 gap-3 flex items-end">
          <span class="font-montserrat">Mail:</span>
          <span class="text-sm opacity-80">{{
            data.branch?.Mail_Address || "Unknown"
          }}</span>
          </div>
          <div class="mx-4 gap-3 flex items-end">
            <span class="font-montserrat">Contact Number:</span>
            <span class="text-sm opacity-80">{{
              data.branch?.Mobile_Number || "Unknown"
            }}</span>
          </div>
          
          <div class="mx-4 gap-3 flex items-end">
            <span class="font-montserrat">Branch Land-Phone:</span>
            <span class="text-sm opacity-80">{{
              data.branch?.Branch_Land_Phone || "Unknown"
            }}</span>
          </div>
        </div>
      </div>
      <SVGCloseCross
        class="ml-auto text-white/60 hover:text-white cursor-pointer"
        :size="'42'"
        @click="emit('dropDown')"
      />
    </div>
     <div class="w-full flex h-full">
        <div class="w-1/4">
          <!-- ALARM PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-[440px] overflow-auto">
            <span class="px-4 pt-4 pb-2 font-semibold text-lg font-montserrat">Alarm Panel</span>
            <div class="mx-4 gap-3 flex">
              <span class="font-montserrat">Device ID:</span>
              <span class="opacity-80 text-sm">{{
                data.mac_id || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex">
              <span class="font-montserrat">Installed On:</span>
              <span class="opacity-80 text-sm">{{
                dateToDDMMYYYY(data.device?.Date_of_Installation) || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex">
              <span class="font-montserrat">Hardware Version:</span>
              <span class="opacity-80 text-sm lowercase">{{
                data.device?.Hardware_Version || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex mb-auto">
              <span class="font-montserrat">Software Version:</span>
              <span class="opacity-80 text-sm lowercase">{{
                data.device?.Software_Version || "Unknown"
              }}</span>
            </div>
            <div
              class="py-2 pl-4 pr-4 flex items-center justify-between my-2 mx-4 bg-white/10 rounded"
            >
              <span>Change Mode:</span>
              <StatusMode :macID="data.mac_id" :status="data.Op_Mode === 'D'" />
            </div>
            <div
              class="p-2 px-4 flex items-center justify-between mx-4 bg-white/10 rounded gap-5"
            >
              <span class="">Access Code:</span>
              <button
                @click="getAccessCode()"
                class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded cursor-pointer w-[120px] flex justify-center items-center"
              >
                <SVGLoading v-if="loadingAccess" />
                <h1 v-else>View Code</h1>
              </button>
            </div>
            <div class="px-4 gap-2 flex items-center justify-between my-2 w-full">
              <div class="flex w-1/2">
                <span
                  @click="reverseAlarm"
                  class="w-full cursor-pointer text-center py-3 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  >Reverse Alarm</span
                >
              </div>
              <div class="flex w-1/2">
                <span
                  @click="resetAlarm"
                  class="w-full cursor-pointer text-center py-3 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  >Reset Alarm</span
                >
              </div>
            </div>
            <div
              class="px-4 gap-2 flex items-center justify-between mb-4 w-full cursor-pointer"
            >
              <div class="flex w-1/2">
                <div
                  class="w-full flex cursor-pointer justify-center items-center px-6 py-2 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  @click="router.push('/dashboard/master/device/' + data.mac_id)"
                >
                  <SVGEdit />
                  <span>Edit</span>
                </div>
              </div>
              <div class="flex w-1/2">
                <div
                  class="w-full flex cursor-pointer justify-center items-center px-6 py-2 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  @click="router.push('/dashboard/reports/history?MacID=' + data.mac_id)"
                >
                  <SVGHistory />
                  <span>History</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-1/4">
          <!-- NETWORK PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-[440px] overflow-auto">
            <span class="px-4 pt-4 pb-2 font-semibold text-lg font-montserrat">Network Panel</span>
            <div class="mx-4 gap-3 flex items-center">
              <span class="font-montserrat">IP Address:</span>
              <span class="opacity-80 text-sm">{{
                data.device?.IP_Address || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex items-center">
              <span class="font-montserrat">Modem IP:</span>
              <span class="opacity-80 text-sm">{{
                data.device?.Modem_IP || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex items-center">
              <span class="font-montserrat">GSM Signal:</span>
              <span class="opacity-80 text-sm lowercase">{{
                '100%'
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex items-center">
              <span class="font-montserrat">GSM Number:</span>
              <span class="opacity-80 text-sm lowercase">{{
                data.device?.GSM_Number || "Unknown"
              }}</span>
            </div>
            <div class="mx-4 gap-3 flex mb-auto">
                <span class="font-montserrat">Mode:</span>
                <div class="grid grid-cols-2 mt-1 gap-x-4 gap-y-2">
                  <span class="opacity-80 text-sm flex items-center gap-2">
                      <SVGEthernet :size="'500'" :class="`${data.Net_Con === 'ethernet' ? 'text-m-green' : 'text-m-red'}`" />
                      Ethernet
                  </span>
                  <span class="opacity-80 text-sm flex items-center gap-2">
                      <SVGWifi :size="'500'" :class="`${data.Net_Con === 'wifi' ? 'text-m-green' : 'text-m-red'}`" />
                      Wi-Fi
                  </span>
                  <span class="opacity-80 text-sm flex items-center gap-2">
                      <SVGCellular :size="'500'" :class="`${data.Net_Con === 'cellular' ? 'text-m-green' : 'text-m-red'}`" />
                      Cellular
                  </span>
                </div>
            </div>
            <div class="flex bg-white/10 rounded mx-4 my-2 py-3 justify-between">
              <div class="flex flex-col w-10/12">
                  <div class="mx-4 gap-2 flex items-center">
                    <span>SSID:</span>
                    <span class="opacity-80 lowercase break-all text-sm">{{
                      data.device?.WIFI_SSID || "Unknown" 
                    }}</span>
                  </div>
                  <div class="mx-4 gap-3 flex items-center">
                    <span>Password:</span>
                    <span  class="opacity-80 lowercase text-sm">{{
                      password || "Unknown"
                    }}</span>
                  </div>
              </div>
              <div class="flex justify-center items-center mr-4 w-2/12">
                <SVGLoading v-if="loadingPassword" />
                <SVGEye @click="getPassword" v-else class="cursor-pointer hover:text-white/90 text-white/60" :size="'28'" />
              </div>
            </div>
            <div class="flex bg-white/10 rounded mx-4 mb-2 py-3 justify-between">
              <div class="flex flex-col mx-4">
                  <span>Last Checked</span>
                  <span class="opacity-80 text-[10px]">{{
                    moment(data.device?.Last_Updated).format("DD MMM YY hh:mm A")
                  }}</span>
              </div>
              <button
                @click="getCheck"
                class=" mr-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded cursor-pointer w-[120px] flex justify-center items-center"
              >
                <SVGLoading v-if="loadingCheck" />
                <h1 v-else>Check</h1>
              </button>
            </div>
            <div
              class="px-4 gap-2 flex items-center justify-between mb-4 w-full cursor-pointer"
            >
              <div class="flex w-1/2">
                <div
                  class="w-full flex cursor-pointer justify-center items-center px-6 py-2 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  @click="router.push('/dashboard/master/device/' + data.mac_id)"
                >
                  <SVGEdit />
                  <span>Edit</span>
                </div>
              </div>
              <div class="flex w-1/2">
                <div
                  class="w-full flex cursor-pointer justify-center items-center px-6 py-2 bg-m-yellow/10 hover:bg-m-yellow/30 text-m-yellow rounded text-sm"
                  @click="router.push('/dashboard/reports/history?MacID=' + data.mac_id)"
                >
                  <SVGHistory />
                  <span>History</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-2/4">
          <!-- ZONE PANEL -->
          <div class="mx-2 flex flex-col bg-white/10 rounded-lg h-[440px] overflow-y-auto">
            <span class="px-4 pt-4 pb-2 font-semibold font-montserrat text-lg">Zone Panel</span>
            <StatusTable :data="data"/>
          </div>
        </div>
      </div>

      <div
        v-if="showAccess"
        class="w-1/2 h-16 fixed top-10 left-[25%] bg-new-black p-3 rounded-lg flex gap-10 items-center justify-center"
      >
        <div
          class="w-[90%] bg-new-blue/10 h-full rounded-lg flex justify-between items-center p-2"
        >
          <input ref="accessElement"
          class="bg-transparent w-full outline-none"
          readonly
          :value="accessCode"/>
          <SVGCopyClipboard class="cursor-pointer" @click="copy"/>
        </div>
        <SVGCloseCross @click="showAccess = false" :size="28" class="cursor-pointer" />
      </div>
    </div>
  </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import moment from 'moment';
const { item, dropOpen } = defineProps(["item", "dropOpen"]);
const emit = defineEmits(["dropDown"]);
const config = useRuntimeConfig();
const data = ref({});
const notification = useNotificationsStore();
const { add } = notification;
const router = useRouter();
const password = ref(data.value?.device?.Password);
const loadingAccess = ref(false);
const loadingPassword = ref(false);
const loadingCheck = ref(false);
const loading = ref(true);
const showAccess = ref(false);
const accessCode = ref("");
const accessElement = ref(null);

function copy(){
     if(document === undefined) return;
      accessElement.value.focus();
      accessElement.value.select();
      accessElement.value.setSelectionRange(0, 99999);
      document.execCommand('copy');
      add({ 
      title: 'Code Copied',
      text: `Access code has been copied to the clipboard`,
    });
}
function dateToDDMMYYYY(date) {
  if(!date) return false;
  let d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

async function getAccessCode() {
  loadingAccess.value = !loadingAccess.value;
  const { data: code, error } = await useFetch(config.public.api + "/api/accessCode/"+ (item?.mac_id || item), {
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  if (error && error.value) {
    add({ 
      title: 'Error',
      text: `Error while fetching access code`,
      color: 'red'
    });
    return;
  }
  accessCode.value = code.value.data.code;
  showAccess.value = true;
  loadingAccess.value = !loadingAccess.value;

}

async function reverseAlarm() {
    const { data, error } = await useFetch( `${config.public.api}/api/reverseAlarm/${item?.mac_id || item}`, {
        headers: {
            authorization: `${localStorage.getItem("token")}`,
        },
    });
    // statusRef.value = !statusRef.value;
}

async function resetAlarm() {
    const { data, error } = await useFetch( `${config.public.api}/api/resetAlarm/${item?.mac_id || item}`, {
        headers: {
            authorization: `${localStorage.getItem("token")}`,
        },
    });
    // statusRef.value = !statusRef.value;
}

async function getPassword() {
  loadingPassword.value = !loadingPassword.value;
  const { data: code, error } = await useFetch(config.public.api + "/api/password/" + (item?.mac_id || item), {
    headers: {
        authorization: `${localStorage.getItem("token")}`,
    },
  });
  loadingPassword.value = !loadingPassword.value;
}

async function getCheck() {
  loadingCheck.value = !loadingCheck.value;
  const { data: code, error } = await useFetch(config.public.api + "/api/lastChecked/" + (item?.mac_id || item), {
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  loadingCheck.value = !loadingCheck.value;
}

async function loadData() {
  console.log("item", item?.mac_id)
  const { data: device, error } = await useFetch(
    `${config.public.api}/api/status/${item?.mac_id || item}`,
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
  if (device.value.statusCode === 200) {
    data.value = device.value.data;
    console.log(data.value);
  }
  loading.value = false;
  return;
}
loadData();
</script>
