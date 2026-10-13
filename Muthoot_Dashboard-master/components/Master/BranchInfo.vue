<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl"
        >Branch Information</span
      >
      <span class="opacity-80 font-light"
        >Enter the general branch details</span
      >
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <div class="flex w-full">
        <CommonText
          @change="(value) => emit('update', value, 'Branch_Name')"
          :title="'Branch Name'"
          :data="data.branch?.Branch_Name"
          :placeholder="'Kadavanthra'"
          class="w-3/4 mr-2"
        />
        <CommonText
          @change="(value) => emit('update', value, 'Code')"
          :title="'Branch Code'"
          :placeholder="'KOD'"
          :data="data.branch?.Code"
          :disabled="Boolean(macID && macID !== 'new')"
          class="w-1/4 ml-2"
        />
      </div>
      <div class="flex w-full">
        <MasterCustomisedDropDown
          :title="'Region'"
          :list="regions"
          :selected="data.branch.Region"
          class="w-3/4 mr-2"
          @update="(value) => emit('update', value, 'Region')"
        />
        <MasterCustomisedDropDown
          :title="'Hub'"
          :list="hubs"
          :selected="data.branch.Hub"
          class="w-3/4 mr-2"
          @update="(value) => emit('update', value, 'Hub')"
        />
      </div>
      <div class="flex w-full">
        <MasterCustomisedDropDown
          :title="'Vertical'"
          :list="verticals"
          :selected="data.branch.Vertical"
          class="w-3/4 mr-2"
          @update="(value) => emit('update', value, 'Vertical')"
        />
        <MasterCustomisedDropDown
          :title="'Zone'"
          :list="zones"
          :selected="data.branch.Zone"
          class="w-3/4 mr-2"
          @update="(value) => emit('update', value, 'Zone')"
        />
      </div>
      <div class="flex w-full">
        <CommonText
          @change="(value) => emit('update', value, 'Risk_Category')"
          :title="'Risk Category'"
          :placeholder="'5'"
          :data="data.branch?.Risk_Category"
          class="w-1/3 mr-2"
        />
        <CommonText
          @change="(value) => emit('update', value, 'Support_Type')"
          :title="'Support Type'"
          :placeholder="'2'"
          :data="data.branch?.Support_Type"
          class="w-1/3"
        />
        <MasterDropdownPickerStatus
          :title="'Branch Status'"
          :list="activeORInactive"
          :selected="data.branch?.Current_Status"
          class="w-1/3 ml-2"
          @update="(value) => emit('update', value, 'Current_Status')"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const config = useRuntimeConfig();

const { data, macID } = defineProps(["data", "macID"]);
console.log(data);
const emit = defineEmits(["update"]);
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

const regions = ref([]);
const hubs = ref([]);
const verticals = ref([]);
const zones = ref([]);

const loadData = async () => {
  const { data, error } = await useFetch(
    `${config.public.api}/api/branch/config/getBranchDropDowns`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );

  if (data.value.statusCode === 200) {
    regions.value = data.value.data.regions;
    hubs.value = data.value.data.hubs;
    verticals.value = data.value.data.verticals;
    zones.value = data.value.data.zones;
  }
  if (error.value) {
    console.log(error);
    return;
  }
};

loadData();
</script>
