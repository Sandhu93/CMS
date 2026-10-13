<template>
  <tr
    :key="key"
    :class="`relative ${
      !dropOpen ? 'cursor-pointer hover:bg-new-blue/20 bg-new-blue/10' : ''
    } h-16 border-b border-new-blue/20`"
    @click="emit('dropDown', key)"
  >
    <td :class="`py-1.5 pl-8 ${dropOpen ? ' bg-new-blue/10' : ''} capitalize`">
      {{ item.branch?.Branch_Name ?? "--" }}
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''} capitalize`">
      {{ item.branch?.Code?.padStart(4, "0") ?? "--" }}
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''} capitalize`">
      {{ item.branch?.Region ?? "--" }}
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''} capitalize`">
      {{ item.branch?.Hub ?? "--" }}
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''} capitalize`">
      <div class="flex gap-2 items-center">
        <span class="relative flex h-3 w-3">
          <span
            :class="`animate-ping absolute inline-flex h-full w-full rounded-full ${
              item.CMS_status === 'online' ? 'bg-m-green' : 'bg-m-red'
            } opacity-75`"
          ></span>
          <span
            :class="`relative inline-flex rounded-full h-3 w-3 ${
              item.CMS_status === 'online' ? 'bg-m-green' : 'bg-m-red'
            }`"
          ></span>
        </span>
        <span class="text-sm">{{
          item.CMS_status === "online" ? "Online" : "Offline"
        }}</span>
      </div>
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''}  `">
      <div v-if="item.Net_Con === 'ethernet'" class="flex items-center gap-2">
        <SVGEthernet class="text-m-green" :size="'500'" />
        <span>Ethernet</span>
      </div>
      <div v-else-if="item.Net_Con === 'wifi'" class="flex items-center gap-2">
        <SVGWifi class="text-m-green" :size="'500'" />
        <span>Wi-Fi</span>
      </div>
      <div
        v-else-if="item.Net_Con === 'cellular'"
        class="flex items-center gap-2"
      >
        <SVGCellular class="text-m-green" :size="'500'" />
        <span>Cellular</span>
      </div>
      <div v-else class="flex items-center gap-2">
        <span>--</span>
      </div>
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''}  `">
      <div v-if="item.Op_Mode === 'D'" class="flex items-center gap-2">
        <SVGDayMode class="text-m-yellow" :size="'500'" />
        <span>Day</span>
      </div>
      <div v-else-if="item.Op_Mode === 'N'" class="flex items-center gap-2">
        <SVGNightMode class="text-white" :size="'500'" />
        <span>Night</span>
      </div>
      <div v-else-if="item.Op_Mode === 'M'" class="flex items-center gap-2">
        <SVGMaintenanceMode class="text-m-green" :size="'500'" />
        <span>Maintenance</span>
      </div>
      <div v-else class="flex items-center gap-2">
        <span>--</span>
      </div>
      <!-- <div v-else class="flex items-center gap-2">
        <SVGLowBatteryMode class="text-m-green" :size="'500'" />
        <span>Low Battery</span>
      </div> -->
    </td>
    <td :class="`py-1.5 text-center ${dropOpen ? ' bg-new-blue/10' : ''}`">
      <div class="mx-auto grid gap-1 w-fit grid-cols-8">
        <!-- BYPASS - ORANGE, TRIGGERED - RED, NORMAL - WHITE -->
        <div v-for="i in zones" :key="i">
          <CommonTooltip :text="getTooltip(i)">
            <span
              :class="`rounded ${
                item.CMS_status === 'online' ? 
                item[`ZONE_${i}`] === undefined
                  ? 'bg-gray-400/10 text-gray-400'
                  : item[`Z${i}_bp`] === '1'
                  ? 'bg-orange-400/10 text-orange-400'
                  : item[`ZONE_${i}`] === 1
                  ? 'bg-m-red/10 text-m-red'
                  : 'bg-m-green/10 text-m-green'
                : 'bg-gray-400/10 text-gray-400'
              } text-center block w-6 text-xs h-6 leading-6 font-semibold`"
            >
              {{ i }}
            </span>
          </CommonTooltip>
        </div>
      </div>
    </td>
    <td :class="`py-1.5 ${dropOpen ? ' bg-new-blue/10' : ''}  `">
      <div class="flex gap-2 items-center w-fit mx-auto">
        <SVGFullBatteryMode
          v-if="percentage(item.Bat_Voltage) > 30"
          class="text-m-green"
          :size="'500'"
        />
        <SVGLowBatteryMode v-else class="text-new-blue" :size="'500'" />
        <span>{{ percentage(item.Bat_Voltage) }}%</span>
      </div>
    </td>
    <td
      :class="`py-1.5 pr-8 text-right ${dropOpen ? ' bg-new-blue/10' : ''}  `"
    >
      {{ moment(item.Date_time).format("DD MMM YY hh:mm A") }}
    </td>
  </tr>
</template>
<script setup>
const { item, dropOpen, key } = defineProps(["item", "dropOpen", "key"]);
import moment from "moment";
import Zones from "@/data/zones";

const zones = ref(
  Array.from(
    {
      length: 16,
    },
    (_, i) => i + 1
  )
);
const emit = defineEmits(["dropDown"]);

const zoneNames = item?.device?.Zones || Zones;

const config = useRuntimeConfig();
function percentage(num) {
  return Math.round(
    (parseFloat(num || 0).toFixed(2) / config.public.batteryVoltage) * 100
  );
}

function getTooltip(zone) {
  return zoneNames[zone - 1] || "Unknown";
}

</script>
