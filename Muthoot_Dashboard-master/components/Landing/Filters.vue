<template>
  <div
    class="flex h-12 bg-m-black-light m-4 rounded-lg items-center pl-4 pr-8 justify-between"
  >
    <SVGFilter class="text-white" :size="'24'" />
    <div class="text-white text-sm cursor-pointer relative">
      <div
        :class="`flex items-center ${
          dropRef.liveStatus ? 'text-m-green' : ''
        } hover:text-m-green`"
        @click="() => dropHandle('liveStatus')"
      >
        <span>Select Live Status</span>
        <SVGDown
          :class="`${
            dropRef.liveStatus ? 'rotate-180' : ''
          } transition-all duration-500`"
        />
      </div>
      <div
        :class="`absolute z-50 w-full overflow-hidden transition-all ease-in-out duration-100 cursor-pointer ${
          dropRef.liveStatus ? 'dropDownActive' : 'dropDownInactive'
        }`"
      >
        <LandingDropDownCheckBox
          :list="selectionLists[1]"
          @updateList="(list) => updateList(list, 1)"
        />
      </div>
    </div>

    <div
      class="text-white text-sm flex items-center cursor-not-allowed opacity-50"
    >
      <span>Select Zone Issue</span>
      <SVGDown />
    </div>

    <div
      class="text-white text-sm flex items-center cursor-not-allowed opacity-50"
    >
      <span>Select Ticket Raised</span>
      <SVGDown />
    </div>

    <div class="text-white text-sm cursor-pointer relative">
      <div
        :class="`flex items-center ${
          dropRef.connectivity ? 'text-m-green' : ''
        } hover:text-m-green`"
        @click="() => dropHandle('connectivity')"
      >
        <span>Select Connectivity</span>
        <SVGDown
          :class="`${
            dropRef.connectivity ? 'rotate-180' : ''
          } transition-all duration-500`"
        />
      </div>
      <div
        :class="`absolute z-50 w-full overflow-hidden transition-all ease-in-out duration-100 cursor-pointer ${
          dropRef.connectivity ? 'dropDownActive' : 'dropDownInactive'
        }`"
      >
        <LandingDropDownCheckBox
          :list="selectionLists[0]"
          @updateList="(list) => updateList(list, 0)"
        />
      </div>
    </div>

    <div
      class="text-white text-sm flex items-center cursor-not-allowed opacity-50"
    >
      <span>Select Verticle</span>
      <SVGDown />
    </div>

    <div
      class="text-white text-sm flex items-center cursor-not-allowed opacity-50"
    >
      <span>Select Region</span>
      <SVGDown />
    </div>

    <div
      class="text-white text-sm flex items-center cursor-not-allowed opacity-50"
    >
      <span>Select Hub</span>
      <SVGDown />
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["updateData"]);
const dropRef = ref({
  liveStatus: false,
  zoneIssue: false,
  ticketRaised: false,
  connectivity: false,
  verticle: false,
  region: false,
  hub: false,
});

const dropHandle = (name) => {
  dropRef.value[name] = !dropRef.value[name];
};

function updateList(list, index) {
  selectionLists.value[index] = list;
  let tempFiltersArray = selectionLists.value[index].filter((item) => {
    if (!item.selected && appliedFilters.value.includes(item.configName)) {
      appliedFilters.value.splice(
        appliedFilters.value.indexOf(item.configName),
        1
      );
    }
    return item.selected;
  });
  tempFiltersArray.forEach((element) => {
    if (!appliedFilters.value.includes(element.configName)) {
      appliedFilters.value.push(element.configName);
    }
  });
  emit("updateData", appliedFilters.value);
}

const appliedFilters = ref([]);

const selectionLists = ref([
  // Connectivity [0]
  [
    {
      id: 1,
      name: "Wi-Fi",
      configName: "wifi",
      selected: false,
      filter: (device) => device.Net_Con === "wifi",
    },
    {
      id: 2,
      name: "Ethernet",
      configName: "ethernet",
      selected: false,
      filter: (device) => device.Net_Con === "ethernet",
    },
    {
      id: 3,
      name: "Cellular",
      configName: "cell",
      selected: false,
      filter: (device) => device.Net_Con === "cellular",
    },
  ],
  // Online Status [1]
  [
    {
      id: 4,
      name: "Online",
      configName: "online",
      selected: false,
      filter: (device) => device.CMS_status === "online",
    },
    {
      id: 5,
      name: "Offline",
      configName: "offline",
      selected: false,
      filter: (device) => device.CMS_status === "offline",
    },
  ],
]);

function updateDrop() {
  dropRef.value.liveStatus = false;
  dropRef.value.zoneIssue = false;
  dropRef.value.ticketRaised = false;
  dropRef.value.connectivity = false;
  dropRef.value.verticle = false;
  dropRef.value.region = false;
  dropRef.value.hub = false;
}

defineExpose({
  updateDrop,
});
</script>
