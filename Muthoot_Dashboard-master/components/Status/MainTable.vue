<template>
  <div class="h-full mx-4 text-white rounded">
    <table class="w-full gap-2">
      <thead>
        <tr class="text-white/80 bg-new-blue/20 rounded-lg">
          <th class="py-3 pl-4">Branch</th>
          <th class="py-3">Code</th>
          <th class="py-3">Region</th>
          <th class="py-3 pr-4">Hub</th>
          <th class="py-3 pr-4">Alarm</th>
          <th class="py-3 pr-4">Connection</th>
          <th class="py-3 pr-4">Mode</th>
          <th class="py-3 pr-4">Zones</th>
          <th class="py-3 pr-4">Battery</th>
          <th class="py-3 pr-4">Last Updated</th>
        </tr>
      </thead>
      <tbody v-if="data.length">
        <StatusTableContent
          :item="item"
          v-for="(item, i) in data"
          :key="item.mac_id"
          :dropOpen="dropOpen"
          @dropDown="handleDrop(item.mac_id)"
        />
      </tbody>
      <tbody class="w-full relative" v-else>
        <div class="text-white/80 rounded-lg w-full absolute flex mt-8">
          <span class="mx-auto">No data available</span>
        </div>
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
import { useNotificationsStore } from "@/store/notifications";
const router = useRouter();
const { data, macID } = defineProps(["data", "macID"]);
const dropOpen = ref(false);
const modalData = ref(macID);
const permissions = localStorage.getItem("permissions");
const notifications = useNotificationsStore();
function handleDrop(item) {
  // router.push("/dashboard/status/" + item.mac_id);
  if(!permissions.includes("ViewStatusDetailed,")){
      notifications.add({
        color: "red",
        title: "Error",
        text: "You do not have permission to view the details",
      });
      return;
  }
  modalData.value = item;
  dropOpen.value = true;
}
if (macID) {
  modalData.value = data.find((v) => v.mac_id === macID);
  dropOpen.value = true;
}
</script>
