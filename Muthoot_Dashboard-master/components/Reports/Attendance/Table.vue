<template>
  <div class="h-full mx-4 text-white mt-4">
    <table class="w-full gap-2">
      <thead>
        <tr
          class="text-white/80 bg-new-blue/10 rounded-lg border-b-4 border-white/10"
        >
          <th class="py-3">Day</th>
          <th class="py-3 pl-4">Mac ID</th>
          <th class="py-3">Branch</th>
          <th class="py-3">Opening Time</th>
          <th class="py-3 pr-4">Closing TIme</th>
          <th class="py-3 pr-4">Duration</th>
        </tr>
      </thead>
      <tbody>
        <ReportsAttendanceTableContent
          :item="item"
          v-for="item in dataPass"
          :key="item._id"
          :branch="item.Branch_Name"
        />
      </tbody>
    </table>
  </div>
</template>
<script setup>
const { dataPass } = defineProps(["dataPass"]);
</script>
