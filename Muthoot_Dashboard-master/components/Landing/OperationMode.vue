<template>
  <div
    class="flex bg-new-blue/10 items-center p-3 justify-around flex-wrap mt-2 rounded-lg"
  >
    <!-- Day Mode -->
    <div
      class="flex cursor-pointer group"
      @click="router.push(`/dashboard/status?Mode[]=Day`)"
    >
      <SVGDayMode :size="'1200'" class="text-new-blue" />
      <div class="flex flex-col text-white group-hover:text-new-blue ml-5">
        <span class="text-3xl font-semibold">{{
          data.filter((d) => d.Op_Mode === "D").length
        }}</span>
        <span class="text-xs ml-auto">Day Mode</span>
      </div>
    </div>
    <!-- Night Mode -->
    <div
      class="flex cursor-pointer group"
      @click="router.push(`/dashboard/status?Mode[]=Night`)"
    >
      <SVGNightMode :size="'1200'" class="text-new-blue" />
      <div class="flex flex-col text-white group-hover:text-new-blue ml-5">
        <span class="text-3xl font-semibold">{{
          data.filter((d) => d.Op_Mode === "N").length
        }}</span>
        <span class="text-xs ml-auto">Night Mode</span>
      </div>
    </div>
    <!-- Maintenance Mode -->
    <div
      class="flex cursor-pointer group"
      @click="router.push(`/dashboard/status?Mode[]=Maintenance`)"
    >
      <SVGMaintenanceMode :size="'1200'" class="text-new-blue" />
      <div class="flex flex-col text-white group-hover:text-new-blue ml-5">
        <span class="text-3xl font-semibold">{{
          data.filter((d) => d.Op_Mode === "M").length
        }}</span>
        <span class="text-xs ml-auto">Maintenance</span>
      </div>
    </div>
    <!-- Low Battery -->
    <div
      class="flex cursor-pointer group"
      @click="router.push(`/dashboard/status?Mode[]=Low%20Battery`)"
    >
      <SVGLowBatteryMode :size="'1200'" class="text-new-blue" />
      <div class="flex flex-col text-white group-hover:text-new-blue ml-5">
        <span class="text-3xl font-semibold">{{
          data.filter((d) => d.Op_Mode === "L").length
        }}</span>
        <span class="text-xs ml-auto">Low Battery</span>
      </div>
    </div>
  </div>
</template>
<script setup>
const { data } = defineProps(["data"]);
const router = useRouter();
</script>
