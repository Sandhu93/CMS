<template>
  <tr
    :id="`subTask-${task.slNo}`"
    :class="`${cClass} max-h-32 w-full z-10 text-white text-montserrat p-2 py-2 text-sm  drop-shadow-xl scale-x-[1.02] ${
      cClass || last ? '' : 'border-b'
    } border-new-blue/20`"
  >
    <td
      :class="`text-center bg-new-blue/20 ${
        last ? 'rounded-bl-md' : ''
      } drop-shadow-xl`"
    >
      {{ task.slNo || "" }}
    </td>
    <td class="bg-new-blue/20">
      {{ moment(task.time).format("DD MMM, HH:mm") }}
    </td>
    <td class="bg-new-blue/20"></td>
    <td class="text-center bg-new-blue/20"></td>
    <td class="text-center bg-new-blue/20"></td>
    <td class="bg-new-blue/20">
      <div
        :style="{
          backgroundColor: `rgba(${convertStatus(task.status).color}, 0.1)`,
          borderColor: `rgba(${convertStatus(task.status).color}, 0.2)`,
          color: `rgba(${convertStatus(task.status).color}, 1)`,
        }"
        :class="`${
          task.status === 'closed' ? 'brightness-[60%]' : ''
        } px-4 py-1 my-3 border rounded-l font-medium text-center border-r-0 h-[95%] items-center justify-center whitespace-nowrap`"
      >
        {{ task.zone }}
      </div>
    </td>
    <td class="bg-new-blue/20">
      <div
        :style="{
          backgroundColor: `rgba(${convertStatus(task.status).color}, 0.1)`,
          borderColor: `rgba(${convertStatus(task.status).color}, 0.2)`,
          color: `rgba(${convertStatus(task.status).color}, 1)`,
        }"
        :class="`${
          task.status === 'closed' ? 'brightness-[60%]' : ''
        } px-4 py-1 my-3 border font-medium text-center border-x-0 h-[95%] items-center justify-center whitespace-nowrap`"
      >
        {{ convertStatus(task.status).value || "" }}
      </div>
    </td>
    <td class="bg-new-blue/20">
      <div
        :style="{
          backgroundColor: `rgba(${convertStatus(task.status).color}, 0.1)`,
          borderColor: `rgba(${convertStatus(task.status).color}, 0.2)`,
          color: `rgba(${convertStatus(task.status).color}, 1)`,
        }"
        :class="`${
          task.status === 'closed' ? 'brightness-[60%]' : ''
        } px-4 py-1 my-3 border rounded-r font-medium text-center border-l-0 h-[95%] items-center justify-center whitespace-nowrap`"
      >
        {{ formatTime(task.time) }}
      </div>
    </td>
    <td class="text-center bg-new-blue/20">{{ task.assignee || "-" }}</td>
    <td class="bg-new-blue/20"></td>
    <td
      :class="`bg-new-blue/20 ${last ? 'rounded-br-md' : ''}`"
    >
      <div class="flex w-fit mx-auto">
        <div>
          <div
            v-if="!task.assignee"
            @click="
              () => {
                confirm = true;
                selectedTask = task;
              }
            "
            :class="`px-4 cursor-pointer py-1  w-fit border-white/30 border bg-white/10 rounded-l-sm text-center flex text-sm h-[95%] items-center justify-between`"
          >
            Claim
          </div>
          <div
            v-else-if="task.assigneeEmail && task.status !== 'closed'"
            @click="
              () => handleClose(task.slNo)
            "
            :class="`px-4 cursor-pointer py-1  w-fit border-white/30 border bg-white/10 rounded-l-sm text-center flex text-sm h-[95%] items-center justify-between`"
          >
            {{task.assigneeEmail === user.email ? 'Close' : 'Taken'}}
          </div>
          <div
            v-else
            :class="`${
        task.status === 'closed' ? 'brightness-[60%]' : ''
      } px-4 cursor-not-allowed dis py-1  w-fit border-white/30 border bg-white/10 rounded-l-sm text-center flex text-sm h-[95%] items-center justify-between`"
          >
            Closed
          </div>
        </div>
        <div
         :class="`${
        task.status === 'closed' ? 'brightness-[60%]' : ''
      } border-white/30 border bg-white/10 rounded-r-sm flex items-center cursor-not-allowed`"
        >
          <SVGDots />
        </div>
      </div>
    </td>
  </tr>
  <teleport to="body">
    <div
      :class="`${
        confirm ? '' : 'hidden'
      } fixed inset-0 z-50 w-screen h-screen bg-black/70 flex items-center justify-center relatve `"
    >
      <div
        @click="confirm = false"
        class="absolute top-0 left-0 w-screen h-screen"
      ></div>
      <div
        class="w-[500px] bg-new-blue/20 backdrop-blur-lg rounded-lg z-[60] p-5 font-montserrat"
      >
        <h1 class="text-white text-center text-2xl font-semibold mb-10">
          Claim Task
        </h1>
        <h1 class="text-white font-semibold">Reason</h1>
        <textarea
          class="w-full h-[150px] bg-new-blue/10 text-white p-4 rounded-xl"
          v-model="note"
        ></textarea>
        <div class="flex gap-5 w-full justify-center text-black mt-10">
          <button
            @click="confirm = false"
            class="bg-new-blue px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            @click="handleClaim(selectedTask, note)"
            class="bg-new-blue px-4 py-2 rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup>
import moment from "moment";
const user = JSON.parse(localStorage.getItem("user"));

const { task, cClass, last } = defineProps(["task", "cClass", "last"]);
const emit = defineEmits(["claimTask", "closeTask"]);
const selectedTask = ref(null);
const confirm = ref(false);
const note = ref("");
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
function formatTime(time) {
  let timeElapsed = moment(time).fromNow().replace(" ago", "");
  return timeElapsed.charAt(0).toUpperCase() + timeElapsed.slice(1);
}
function handleClaim(task, note) {
  confirm.value = false;
  emit("claimTask", task.slNo, note);
}

function handleClose(slNo) {
  emit("closeTask", slNo);
}
</script>
