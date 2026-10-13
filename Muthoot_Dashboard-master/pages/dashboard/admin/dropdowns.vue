<template>
  <div class="h-full w-full max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
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
    </div>

    <div v-else class="h-full">
      <div class="flex w-full overflow-hidden">
        <!-- REGIONS -->

        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Region</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'regions';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Region</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4 overflow-y-scroll h-[80%]"
          >
            <div
              v-for="(region, i) in regions"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'regions')"
                :name="region"
                :index="i"
              />
            </div>
          </div>
        </div>

        <!-- VERTICALS -->

        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Vertical</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'verticals';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Vertical</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4 h-[80%] overflow-y-scroll"
          >
            <div
              v-for="(vertical, i) in verticals"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'verticals')"
                :name="vertical"
                :index="i"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full">
        <!-- HUB -->

        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Hubs</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'hubs';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Hub</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4 h-[80%] overflow-y-scroll"
          >
            <div
              v-for="(hub, i) in hubs"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'hubs')"
                :name="hub"
                :index="i"
              />
            </div>
          </div>
        </div>
        <!-- ZONES -->

        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Zones</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'zones';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Zone</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4 h-[80%] overflow-y-scroll"
          >
            <div
              v-for="(zone, i) in zones"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'zones')"
                :name="zone"
                :index="i"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full mb-2">
        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Providers</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'providers';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Provider</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4 h-[80%] overflow-y-scroll"
          >
            <div
              v-for="(provider, i) in providers"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'providers')"
                :name="provider"
                :index="i"
              />
            </div>
          </div>
        </div>
        <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
          <div
            class="flex w-full justify-between pl-8 pr-4 pt-8 text-white h-[20%] items-center"
          >
            <h1 class="text-2xl font-semibold">Status Reasons</h1>
            <div class="flex gap-4">
              <div
                v-if="userPermissions.includes('EditUser,')"
                @click="
                  () => {
                    dropDownAdd = true;
                    addType = 'statusReasons';
                  }
                "
                class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
              >
                <SVGPlus class="text-white" />
                <span class="font-medium">Add Reason</span>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col px-4 py-8 rounded-lg m-4 bg-new-blue/10 gap-4 h-[80%] overflow-y-scroll"
          >
            <div
              v-for="(statusReason, i) in statusReasons"
              :key="i"
              class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
            >
              <DropdownsDropdownCard
                @toggleDropDelete="updateConfig($event, 'del', 'statusReasons')"
                :name="statusReason"
                :index="i"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <DropdownsAddModel
      v-if="dropDownAdd"
      @cancelAdd="
        () => {
          dropDownAdd = false;
          addType = '';
        }
      "
      @addItem="updateConfig($event, 'insert', addType)"
    />
  </div>
</template>
<script setup>
const config = useRuntimeConfig();

definePageMeta({
  layout: "dashboard",
});

useHead({
  title: `DropDowns `,
});

const dropDownAdd = ref(false);
const addType = ref("");

const userPermissions = ref(localStorage.getItem("permissions"));

const regions = ref([]);

const verticals = ref([]);

const hubs = ref([]);

const zones = ref([]);

const statusReasons = ref([]);

const providers = ref([]);

async function updateConfig(updateVal, type, dropType) {
  dropDownAdd.value = false;
  const { data, error } = await useFetch(
    `${config.public.api}/api/branch/config/updateDropDowns`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        updateVal,
        type,
        dropType,
      }),
    }
  );

  if (error.value) {
    if (error.value.statusCode === 401) {
      popup.value.update(`Error Updating. ${error.value.statusMessage}`, "red");
    }
    console.log(error.value);
    return;
  }
  if (data.value.statusCode === 200) {
    console.log(data.value.data.value);
    switch (dropType) {
      case "regions":
        regions.value = data.value.data.value.regions;
        break;

      case "verticals":
        verticals.value = data.value.data.value.verticals;
        break;

      case "hubs":
        hubs.value = data.value.data.value.hubs;
        break;

      case "zones":
        zones.value = data.value.data.value.zones;
        break;

      case "statusReasons":
        statusReasons.value = data.value.data.value.statusReasons;
        break;

      case "providers":
        providers.value = data.value.data.value.providers;
        break;
      default:
        break;
    }
  }
}

async function loadData() {
  const { data, error } = await useFetch(
    `${config.public.api}/api/branch/config/getDropDowns`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error.value);
    if (popup.value)
      popup.value.update(
        `${error.value.statusCode} ${error.value.statusMessage}`,
        "red"
      );
    return;
  }
  if (data.value.statusCode === 200) {
    const tempData = data.value.data;
    regions.value = tempData.regions;
    verticals.value = tempData.verticals;
    hubs.value = tempData.hubs;
    zones.value = tempData.zones;
    statusReasons.value = tempData.statusReasons;
    providers.value = tempData.providers;
  }
  loading.value = false;
}
loadData();
</script>
