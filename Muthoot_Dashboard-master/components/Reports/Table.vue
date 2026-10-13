<template>
  <div class="h-full mx-4 text-white mt-4">
    <table class="w-full gap-2">
      <thead>
        <tr
          class="text-white/80 bg-new-blue/10 rounded-lg border-b-4 border-white/10"
        >
          <th class="py-3 pr-4">Date</th>
          <th class="py-3 pl-4">Mac ID</th>
          <th class="py-3">Branch</th>
          <th class="py-3">Level</th>
          <th class="py-3">Message</th>
          <th class="py-3 pr-4">Duration</th>
        </tr>
      </thead>
      <tbody v-if="loading" class="animate-pulse w-full">
        <tr
          v-for="i in range(10)"
          class="w-full h-[50px] bg-new-blue/10 my-1 border-b-4 border-white/10"
        >
          <td class="h-[50px]"></td>
          <td class="h-[50px]"></td>
          <td class="h-[50px]"></td>
          <td class="h-[50px]"></td>
          <td class="h-[50px]"></td>
          <td class="h-[50px]"></td>
        </tr>
      </tbody>
      <tbody v-else>
        <ReportsTableContent
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
const { dataPass, loading } = defineProps(["dataPass", "loading"]);
function range(n) {
  return Array.from({ length: n }, (v, k) => k + 1);
}
</script>
