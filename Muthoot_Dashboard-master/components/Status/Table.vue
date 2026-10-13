<template>
  <div class="mx-4 text-white pb-2 pl-1">
    <table class="w-full gap-2 h-full">
      <thead class="font-montserrat">
        <tr class="text-white/80 rounded-lg">
          <th class="font-normal text-left">Zone</th>
          <th class="font-normal">Status</th>
          <th class="font-normal">Types</th>
          <th class="font-normal pr-4">History</th>
          <th class="font-normal pr-4">L.S Change</th>
          <th class="font-normal pr-4">Model</th>
          <th class="font-normal pr-4">Bypass</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="index in zones"
          :key="index"
          class="text-white/80 rounded-lg"
        >
          <td class="text-center">{{ index + 1 }}</td>
          <td>
            <div class="flex gap-2 items-center">
              <span class="relative flex h-3 w-3 mx-auto">
                <span
                  :class="`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    data.CMS_status === 'online' ?
                    data[`Z${index+1}_bp`] === '1' ? 'bg-m-yellow' :
                    data['ZONE_' + (index + 1)] === 1
                      ? 'bg-m-red'
                      : 'bg-m-green'
                    : 'bg-transparent'
                  } opacity-75`"
                ></span>
                <span
                  :class="`relative inline-flex rounded-full h-3 w-3 ${
                    data[`ZONE_${index+1}`] !== undefined && data.CMS_status === 'online' ?
                    data[`Z${index+1}_bp`] === '1' ? 'bg-m-yellow' :
                      data['ZONE_' + (index + 1)] === 1
                      ? 'bg-m-red'
                      : 'bg-m-green'
                    : 'bg-gray-400'
                  }`"
                ></span>
              </span>
            </div>
          </td>
          <td>
            <span class="text-sm">{{ zoneNames[index] || "Unknown" }}</span>
          </td>
          <td>
            <SVGHistory
              class="mx-auto text-white/80 hover:text-white cursor-pointer"
            />
          </td>
          <td class="text-center">
            <span class="text-sm">11 Apr 23 10:00 am</span>
          </td>
          <td class="text-center">
            <span>v1</span>
          </td>
          <td>
            <CommonToggle
              class="my-1"
              :enabled="data['Z' + (index + 1) + '_bp'] && data['Z' + (index + 1) + '_bp'] !== '0'"
              @update="(value) => bypassToggle(index+1, value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <StatusModal
      v-if="dropOpen"
      :item="modalData"
      :dropOpen="dropOpen"
      @dropDown="dropOpen = false"
    />
  </div>
</template>
<script setup>
import Zones from "@/data/zones";
const config = useRuntimeConfig();
    
const { data } = defineProps(["data"]);
const zoneNames = data?.device?.Zones || Zones;
const dropOpen = ref(false);
const modalData = ref(null);

const zones = ref(
  Array.from(
    {
      length: 16,
    },
    (_, i) => i
  )
);

async function bypassToggle(zoneNo, value) {
      const { data2, error } = await useFetch( `${config.public.api}/api/bypassZone/${data.mac_id}/${zoneNo}/${value ? 'T' : 'F' }`, {
          headers: {
              authorization: `${localStorage.getItem("token")}`,
          },
      });
}
</script>
