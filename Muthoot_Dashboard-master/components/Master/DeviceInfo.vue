<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl"
        >Device Information</span
      >
      <span class="opacity-80 font-light"
        >Enter the general device details</span
      >
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <div class="flex w-full">
        <CommonText
          :title="'Device ID'"
          @change="(value) => emit('update', value, 'Device_ID')"
          :data="data.device?.Device_ID"
          :placeholder="'Kadavanthra'"
          class="w-1/3 mr-2"
        />
        <MasterDropdownPickerStatus
          :title="'Device Status'"
          :list="activeORInactive"
          :selected="data.device?.Current_Status || 'Active'"
          class="w-1/3 mx-2"
          @update="(val) => emit('update', val.value, 'Current_Status')"
        />
        <MasterCustomisedDropDown
        :title="'Status Reason'"
        @update="(value) => emit('update', value, 'Status_Reason')"
        :list="statusReasons"
        :selectedChannel="data.device?.Status_Reason || 'None'"
        class="w-1/3 ml-2"
      />
      </div>
      <div class="flex w-full">
        <CommonText
          :title="'Installation Date'"
          @change="(value) => emit('update', value, 'Date_of_Installation')"
          :data="installDate"
          :type="'date'"
          class="w-1/2 mr-2"
        />
        <CommonText
          :title="'Warranty Period'"
          @change="(value) => emit('update', value, 'Warranty_Period')"
          :data="warrantyDate"
          :type="'date'"
          class="w-1/2 ml-2"
        />
      </div>
      <div class="flex w-full">
        <CommonText
          :title="'Hardware Version'"
          @change="(value) => emit('update', value, 'Hardware_Version')"
          :data="data.device?.Hardware_Version"
          :placeholder="'v2'"
          :validation="validate.hardware"
          :errorMessage="errorMessage.hardware"
          class="w-1/2 mr-2"
        />
        <CommonText
          :title="'Software Version'"
          @change="(value) => emit('update', value, 'Software_Version')"
          :data="data.device?.Software_Version"
          :placeholder="'v2'"
          :validation="validate.software"
          :errorMessage="errorMessage.software"
          class="w-1/2 ml-2"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const { data, statusReasons } = defineProps(["data", "statusReasons"]);
const installDate = ref("");
const warrantyDate = ref("");
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
if (
  data.device?.Date_of_Installation !== undefined &&
  data.device?.Date_of_Installation !== null &&
  data.device?.Date_of_Installation !== ""
) {
  const date = new Date(data.device.Date_of_Installation);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  installDate.value = `${year}-${month}-${day}`;
}
if (
  data.device?.Warranty_Period !== undefined &&
  data.device?.Warranty_Period !== null &&
  data.device?.Warranty_Period !== ""
) {
  const date = new Date(data.device.Warranty_Period);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  warrantyDate.value = `${year}-${month}-${day}`;
}
const emit = defineEmits(["update"]);
const validate = ref({
  hardware: function (value) {
    return /^v[a-zA-Z0-9- ]*$/i.test(value) ? true : false;
  },
  software: function (value) {
    return /^v[a-zA-Z0-9- ]*$/i.test(value) ? true : false;
  },
});
const errorMessage = ref({
  hardware: "Hardware version should start with 'v'",
  software: "Software version should start with 'v'",
});
</script>
