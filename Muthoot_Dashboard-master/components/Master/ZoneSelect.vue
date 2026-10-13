<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl"
        >Zone Information</span
      >
      <span class="opacity-80 font-light"
        >Enter the Zone details and current mode</span
      >
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <div v-for="(item, index) in zones" class="flex w-full" :key="index">
        <CommonText
          :data="`Zone ${index + 1}`"
          :title="'Zone ID'"
          :placeholder="`Zone ${index + 1}`"
          :disabled="true"
          class="w-2/12 mr-2"
        />
        <CommonZones
          :list="zones"
          :selected="index + 1"
          @update="updateZoneName($event, index)"
          class="w-7/12 mx-2"
        />
        <MasterDropdownPicker
          :title="'Zone Mode'"
          :list="list"
          :selected="
            data[`Z${index + 1}_bp`] == 1
              ? 'bypassed'
              : data[`ZONE_${index + 1}`] == 1
              ? 'disabled'
              : 'active'
          "
          @update="updateZoneStatus($event, index)"
          class="w-3/12 mr-2"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const { data } = defineProps(["data"]);
const zones = ref(data.device.Zones);
const emit = defineEmits(["update"]);
const list = ref([
  {
    name: "Active",
    value: "active",
  },
  {
    name: "Bypassed",
    value: "bypassed",
  },
  {
    name: "Disabled",
    value: "disabled",
  },
]);
function updateZoneStatus(value, index) {
  if (value.value === "active") {
    data[`Z${index + 1}_bp`] = "0";
    data[`ZONE_${index + 1}`] = "0";
  } else if (value.value === "bypassed") {
    data[`Z${index + 1}_bp`] = "1";
    data[`ZONE_${index + 1}`] = "0";
  } else if (value.value === "disabled") {
    data[`Z${index + 1}_bp`] = "0";
    data[`ZONE_${index + 1}`] = "1";
  }
  emit("update", data);
}
function updateZoneName(updatedVal, index) {
  let temp = data.device.Zones.find((v) => v === updatedVal);
  let tempIndex = data.device.Zones.indexOf(temp);
  zones.value[tempIndex] = zones.value[index];
  zones.value[index] = updatedVal;
  emit("update", zones.value);
}
</script>
