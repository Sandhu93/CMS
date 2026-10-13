<template>
  <Transition appear>
    <tr
      :id="`task-${slNo}`"
      :class="` ${
        dropped && tasks.length > 0
          ? 'backdrop-blur-xl text-sm scale-x-[1.02]'
          : ''
      } transition-all ease-in-out duration-500 text-sm`"
    >
      <td :class="`${dropped ? 'bg-new-blue/20 rounded-tl-md' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 text-center`">{{ slNo || "" }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20 text-white/0' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">{{ moment(time).format("DD MMMM, HH:mm") }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">{{ branchName || "" }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 text-center`">{{ branchCode || "" }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 text-center`">{{ region || "" }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">
        <div
          :style="{
            backgroundColor: `rgba(${status.color}, 0.1)`,
            borderColor: `rgba(${status.color}, 0.2)`,
            color: `rgba(${status.color}, 1)`,
          }"
          :class="`${dropped ? 'opacity-0' : ''} px-4 py-1 my-2.5 border rounded-l font-medium text-center border-r-0 items-center justify-center whitespace-nowrap `"
        >
          {{ zones.length ? `${zones[0]}${zones.length > 1 ? `, ${zones.length-1}+` : ''}`  :  "-" }}
        </div>
      </td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">
        <div
          :style="{
            backgroundColor: `rgba(${status.color}, 0.1)`,
            borderColor: `rgba(${status.color}, 0.2)`,
            color: `rgba(${status.color}, 1)`,
          }"
          :class="`${dropped ? 'opacity-0' : ''} px-4 py-1 my-2.5 border font-medium text-center border-x-0 items-center justify-center whitespace-nowrap`"
        >
          {{ status.value || "" }}
        </div>
      </td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">
        <div
          :style="{
            backgroundColor: `rgba(${status.color}, 0.1)`,
            borderColor: `rgba(${status.color}, 0.2)`,
            color: `rgba(${status.color}, 1)`,
          }"
          :class="`${dropped ? 'opacity-0' : ''} px-4 py-1 my-2.5 border rounded-r font-medium text-center border-l-0 items-center justify-center whitespace-nowrap`"
        >
          {{ formatTime(time) }}
        </div>
      </td>
      <td :class="`${dropped ? 'bg-new-blue/20 text-white/0' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 text-center`">{{ assignee.length ? `${assignee[0]}${assignee.length > 1 ? `, ${assignee.length-1}+` : ''}`  :  "-" }}</td>
      <td :class="`${dropped ? 'bg-new-blue/20' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 `">
        <div class="w-full relative bg-new-blue/30 h-3 rounded-lg">
          <div
            :style="{ width: progress }"
            class="absolute top-0 left-0 bg-new-blue h-3 rounded-lg"
          ></div>
        </div>
      </td>
      <td
       :class="`${dropped ? 'bg-new-blue/20 rounded-bl-md' : 'bg-new-blue/[0.05]'} border-b border-new-blue/20 cursor-pointer justify-center ${dropped ? 'rotate-180' : ''}`"
        @click="dropChange()"
      >
        <SVGDown class="mx-auto" />
      </td>
    </tr>
    </Transition>
    <!-- <Teleport to="#tableBody">
      <tr
        v-if="drop"
        :style="{ 'max-height': drop ? '1000px' : '0' }"
        :class="`overflow-hidden transition-all ease-in-out duration-500 ${
          drop && tasks.length > 0 ? 'rounded-b-xl' : ''
        }`"
      >
        <td colspan="11">
          <AlertsTableSubRow :tasks="tasks" @claimTask="handleClaimTask" />
        </td>
      </tr>
    </Teleport> -->
</template>
<script setup>
import moment from "moment";
const emit = defineEmits(["claim", "drop"]);
const props = defineProps(["data", "dropped"]);

const slNo = computed(() => props.data.slNo);
const branchName = computed(() => props.data.branchName);
const branchCode = computed(() => props.data.branchCode);
const region = computed(() => props.data.region);
const tasks = computed(() => props.data.tasks);
const assignee = computed(() => [...new Set(tasks.value.map(t => t.assignee).filter(i => i))] );
const zones = [...new Set(tasks.value.map(t => t.zone).filter(i => i))];

const drop = ref(false);
function dropChange() {
  drop.value = !drop.value;
  emit("drop", drop.value);
}

function handleClaimTask(slNo) {
  console.log(tasks.value.length);
  if (tasks.value.length <= 1) {
    drop.value = false;
  }
  emit("claim", slNo);
}

function convertStatus(str) {
  switch (str) {
    case "todo":
      return { value: "To Do", color: "255, 82, 82" };
    case "inprogress":
      return { value: "In Progress", color: "254, 160, 71" };
    case "closed":
      return { value: "Closed", color: "255, 255, 255" };
    default:
      return { value: "", color: "" };
  }
}
function getPriorityStatus() {
  // Filter tasks by each status
  const todoTasks = tasks.value.filter(task => task.status === "todo");
  const inProgressTasks = tasks.value.filter(task => task.status === "inprogress");
  const closedTasks = tasks.value.filter(task => task.status === "closed");

  // Sort each array by time in descending order
  const latestTodo = todoTasks.sort((a, b) => b.time - a.time)[0];
  const latestInProgress = inProgressTasks.sort((a, b) => b.time - a.time)[0];
  const latestClosed = closedTasks.sort((a, b) => b.time - a.time)[0];

  // Determine the latest task among the three statuses
  const latestTask = latestTodo || latestInProgress || latestClosed;

  // If a task was found, return its details
  if (latestTask) {
    return {
      status: latestTask.status,
      zone: latestTask.zone,
      time: latestTask.time,
    };
  }

  throw new Error("Invalid status");
}
let { status, zone, time } = getPriorityStatus();
status = convertStatus(status);
let progress = `${
  (tasks.value.filter((task) => task.status === "closed").length /
    tasks.value.length) *
  100
}%`;
function formatTime(time) {
  let timeElapsed = moment(time).fromNow().replace(" ago", "");
  return timeElapsed.charAt(0).toUpperCase() + timeElapsed.slice(1);
}
</script>
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
