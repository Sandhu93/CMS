<template>
  <tbody id="tableBody" class="w-full">
    <template v-for="task in tasks" :key="task.slNo">
      <AlertsTableRow
        :data="task"
        @claim="handleClaim"
        @drop="(x) => (x ? (dropTasks = task.slNo) : (dropTasks = null))"
        :dropped="dropTasks === task.slNo"
      />
      <template v-for="(subTask, index) in task.tasks" :key="subTask.slNo">
        <AlertsTableSubRow
          :task="subTask"
          :cClass="dropTasks === task.slNo ? '' : 'collapse'"
          :last="index == task.tasks.length - 1"
          @claimTask="handleClaim"
          @closeTask="handleClose"
        />
      </template>
      <!-- <tr
        :class="`overflow-hidden transition-all ease-in-out duration-500 ${
          task.tasks.length > 0 ? 'rounded-b-xl' : ''
        }`"
      >
        <td colspan="11">
          <AlertsTableSubRow :tasks="task.tasks" />
        </td>
      </tr> -->
    </template>
  </tbody>
</template>
<script setup>
const { tasks } = defineProps(["tasks"]);
const dropTasks = ref(null);
const emit = defineEmits(["claim", "close"]);
function handleClaim(slNo, note) {
  emit("claim", slNo, note);
}
function handleClose(slNo) {
  emit("close", slNo);
}
</script>
