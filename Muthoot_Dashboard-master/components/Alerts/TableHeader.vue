<template>
  <Transition appear>
    <thead
      class="w-full border-new-blue/30 text-white font-medium h-12 rounded-t-xl mt-5"
    >
      <tr class="rounded-t-xl">
        <th class="font-medium bg-new-blue/30 rounded-tl-md px-2">SI. No</th>
        <th class="font-medium bg-new-blue/30">Time</th>
        <th class="font-medium bg-new-blue/30">Branch</th>
        <th class="font-medium bg-new-blue/30">Code</th>
        <th class="font-medium bg-new-blue/30">Region</th>
        <th class="font-medium bg-new-blue/30">Zone</th>
        <th class="font-medium bg-new-blue/30">Status</th>
        <th class="font-medium bg-new-blue/30">Duration</th>
        <th class="font-medium bg-new-blue/30">Assignee</th>
        <th class="font-medium bg-new-blue/30">Progress</th>
        <th class="font-medium bg-new-blue/30 rounded-tr-md px-2">Actions</th>
      </tr>
    </thead>
  </Transition>
</template>
<script setup></script>
<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
