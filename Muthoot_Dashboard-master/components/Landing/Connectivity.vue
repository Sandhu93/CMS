<template>
  <div class="flex justify-between mr-2">
    <div
      class="flex cursor-pointer group"
      @click="router.push('/dashboard/status?Connectivity[]=Ethernet')"
    >
      <SVGEthernet class="mt-auto text-new-blue" :size="'1200'" />
      <div class="flex flex-col text-white group-hover:text-new-blue min-w-fit ml-8">
        <span class="text-3xl pt-1 font-semibold ml-auto">{{
          data.filter((d) => d.Net_Con === "ethernet").length
        }}</span>
        <span class="text-xs ml-auto">Ethernet</span>
      </div>
    </div>
    <div
      class="flex cursor-pointer group"
      @click="router.push('/dashboard/status?Connectivity[]=Wi-Fi')"
    >
      <SVGWifi class="mt-auto text-new-blue" :size="'1200'" />
      <div class="flex flex-col text-white group-hover:text-new-blue min-w-fit ml-8">
        <span class="text-3xl pt-1 font-semibold ml-auto">{{
          data.filter((d) => d.Net_Con === "wifi").length
        }}</span>
        <span class="text-xs ml-auto">Wi-Fi</span>
      </div>
    </div>
    <div
      class="flex cursor-pointer group"
      @click="router.push('/dashboard/status?Connectivity[]=Cellular')"
    >
      <SVGCellular class="mt-auto text-new-blue" :size="'1200'" />
      <div class="flex flex-col text-white group-hover:text-new-blue min-w-fit ml-8">
        <span class="text-3xl pt-1 font-semibold ml-auto">{{
          data.filter((d) => d.Net_Con === "cellular").length
        }}</span>
        <span class="text-xs ml-auto">Cellular</span>
      </div>
    </div>
  </div>
</template>
<script setup>
const { data } = defineProps(["data"]);
const router = useRouter();
// const update = function(value) {
//   console.log("update", value);
//   data = value;
// }
// defineExpose({ update });
</script>
