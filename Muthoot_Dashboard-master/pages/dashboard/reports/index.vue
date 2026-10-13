<template>
  <div class="w-full">
    <div class="flex flex-row h-full w-full max-w-screen-2xl mx-auto">
      <!-- Table -->
      <div class="w-1/2 text-white pt-20 pl-10 pr-16">
        <div class="flex flex-col mb-6 gap-6">
          <span class="text-2xl font-bold">Log Reports</span>
          <span class="opacity-80"
            >View the complete report of actions and monitors related to all the
            devices and branches.</span
          >
        </div>
        <div class="flex flex-col mb-6 gap-2">
          <span class="text-lg font-medium">Super Admin role</span>
          <span class="opacity-80"
            >Super Admins have top tier access to the entire dashboard.</span
          >
        </div>
      </div>
      <!-- Table -->
      <div
        class="m-16 flex flex-col w-1/2 justify-center items-center gap-4 text-white"
      >
        <div
          v-if="permissions.includes('ViewHistory,')"
          class="bg-white/10 hover:bg-new-blue/10 group hover:text-new-blue rounded flex cursor-pointer py-6 px-6 gap-4 h-full items-center w-full m-2"
          @click="router.push('/dashboard/reports/history')"
        >
          <div
            class="h-16 w-16 bg-white/30 group-hover:bg-new-blue/30 flex items-center justify-center rounded"
          >
            <SVGHistory :size="'80'" class="pl-0.5" />
          </div>
          <div class="flex flex-col w-3/4">
            <span class="text-xl font-semibold">History</span>
            <span>View the entire logs of all actions on the devices</span>
          </div>
        </div>
        <div
          v-if="permissions.includes('ViewAttendance,')"
          class="bg-white/10 hover:bg-new-blue/10 group hover:text-new-blue rounded flex cursor-pointer py-6 px-6 gap-4 h-full items-center w-full m-2"
          @click="router.push('/dashboard/reports/attendance')"
        >
          <div
            class="h-16 w-16 bg-white/30 group-hover:bg-new-blue/30 flex items-center justify-center rounded"
          >
            <SVGAttendance :size="'60'" class="pb-0.5" />
          </div>
          <div class="flex flex-col w-3/4">
            <span class="text-xl font-semibold">Attendance</span>
            <span
              >View the day-to-day branch opening and closing times of every
              branch</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Reports`,
});
const router = useRouter();
const permissions = ref(localStorage.getItem("permissions"));
</script>
