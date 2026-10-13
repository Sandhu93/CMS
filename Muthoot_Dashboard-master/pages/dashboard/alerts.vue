<template>
  <div class="max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
    </div>
    <div v-else class="flex flex-col h-full w-full text-white gap-4 pb-16">
      <div
        :class="`${
          giveHeaderBg ? 'bg-black z-40' : ''
        } flex w-full px-8 py-8 justify-between items-center gap-8`"
      >
        <div class="flex flex-col gap-4 h-full">
          <span class="text text-white/80 font-montserrat font-semibold"
            >Task Overview</span
          >
          <div
            class="bg-new-blue/10 border border-new-blue/30 flex rounded-xl px-4 py-5 gap-4"
          >
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-4xl">{{
                allTasks.reduce(
                  (acc, group) =>
                    acc +
                    group.tasks.filter((task) => task.status === "closed")
                      .length,
                  0
                )
              }}</span>
              <span class="text-sm text-new-blue">Tasks Completed</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-4xl">{{
                allTasks.reduce(
                  (acc, group) =>
                    acc +
                    group.tasks.filter((task) => task.status === "todo").length,
                  0
                )
              }}</span>
              <span class="text-sm text-m-red">Requires Attention</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-semibold text-4xl">{{
                allTasks.reduce(
                  (acc, group) =>
                    acc +
                    group.tasks.filter((task) => task.status === "inprogress")
                      .length,
                  0
                )
              }}</span>
              <span class="text-sm text-m-yellow">Are In Progress</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4 flex-1">
          <span class="text text-white/80 font-montserrat font-semibold"
            >Zone Issues</span
          >
          <div
            class="bg-new-blue/10 border border-new-blue/30 flex rounded-xl px-4 pt-4 w-full"
          >
            <LandingZoneIssuesGauges
              :zoneGauge="zoneGauge"
              :total="data.length"
              class="cursor-pointer justify-between w-full"
            />
          </div>
        </div>
      </div>
      <transition name="fade" mode="out-in">
        <div
          v-if="userTasks.length > 0"
          class="px-8 transition-all duration-300 ease-in-out"
        >
          <h1 class="text-white/80 font-montserrat font-semibold">
            Your Tasks
          </h1>
          <table class="w-full">
            <AlertsTableHeader />
            <AlertsTableBody :tasks="userTasks" @close="closeApiCall"/>
          </table>
        </div>
        <div v-else class="px-8 transition-all duration-300 ease-in-out">
          <h1 class="text-white/80 font-montserrat font-semibold">
            Your Tasks
          </h1>
          <h1 class="text-white/60 font-montserrat text-center pb-12 pt-4">
            You don't have any pending tasks
          </h1>
        </div>
      </transition>
      <div class="px-8">
        <h1 class="text-white/80 font-montserrat font-semibold">All Tasks</h1>
        <table class="transition-all duration-300 ease-in-out w-full">
          <AlertsTableHeader />
          <AlertsTableBody :tasks="allTasks" @claim="claimApiCall" />
        </table>
      </div>
    </div>
    <SettingsMFA v-if="showMFA" @close="showMFA = false" :data="data" />
    <CommonPopup ref="popup" />
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
import Zones from "@/data/zones";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Alerts`,
});
const { $io } = useNuxtApp();
const io = $io(localStorage.getItem("token"));
const notification = useNotificationsStore();
const { add } = notification;
const popup = ref(null);

const data = ref(null);
let zoneGauge = ref([]);
const loading = ref(true);
const userTasks = ref([]);
const allTasks = ref([]);
const scrollContainer = ref(null);
const giveHeaderBg = ref(false);
let lastScrollPosition = 0;
const dropTasks = ref(false);

const user = JSON.parse(localStorage.getItem("user"));

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

const taskExample = {
  slNo: 100,
  time: 1712395055000,
  zone: "Zone 1",
  status: "todo",
  assignee: "User 1",
  assigneeEmail: "test@example.com",
};

const dummyTasks = [
  {
    slNo: 1,
    status: "open",
    branchCode: "B001",
    branchName: "Branch 1",
    region: "Region 1",
    slNos: [1, 2],
    tasks: [taskExample, taskExample],
  },
];

async function closeApiCall(slNo){
  const { data, error } = await useFetch(
    `${config.public.api}/api/tasks/close/${slNo}`,
    {
      method: "POST",
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );

  if (error.value) {
    add({
      title: `Error ${error.value.statusCode}`,
      text: error.value.data.statusMessage,
      color: "red",
    });
    return;
  }
  if (data.value.statusCode === 200) {
    add({
      title: "Task Closed",
      text: "Task has been closed successfully",
      color: "green",
    });
    return;
  }
  add({
    title: "Task Close Failed",
    text: "Task could not be closed",
    color: "red",
  });

}

async function claimApiCall(slNo, note) {
  const { data, error } = await useFetch(
    `${config.public.api}/api/tasks/claim/${slNo}`,
    {
      method: "POST",
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ note }),
    }
  );

  if (error.value) {
    add({
      title: `Error ${error.value.statusCode}`,
      text: error.value.data.statusMessage,
      color: "red",
    });
    return;
  }
  if (data.value.statusCode === 200) {
    add({
      title: "Task Claimed",
      text: "Task has been claimed successfully",
      color: "green",
    });
    return;
  }
  add({
    title: "Task Claim Failed",
    text: "Task could not be claimed",
    color: "red",
  });
}

async function handleClose(groupSlNo, taskSlNo) {
  let foundGroup = userTasks.value.find((g) => g.slNo === groupSlNo);

  if (foundGroup) {
    // If there's only one task in the group, remove the entire group
    if (foundGroup.tasks.length === 1) {
      let groupIndex = allTasks.value.findIndex((g) => g.slNo === groupSlNo);
      if (groupIndex !== -1) {
        userTasks.value.splice(groupIndex, 1);
      }
    } else {
      // If there are more tasks, find the task and remove it
      let taskIndex = foundGroup.tasks.findIndex((t) => t.slNo === taskSlNo);
      if (taskIndex !== -1) {
        foundGroup.tasks.splice(taskIndex, 1);
      }
    }
  }
}

async function handleClaim(slNo) {
  let mainTask;
  let subTask;
  allTasks.value.find((group) => {
    subTask = group.tasks.find((task) => task.slNo === slNo);
    if (subTask) {
      subTask = toRaw(subTask);
      mainTask = group;
      return true;
    }
  });
  // const subTaskElement = document.getElementById(`subTask-${subTask.slNo}`);
  // const taskElement = document.getElementById(`task-${mainTask.slNo}`);
  //Animate the removal
  // if (subTaskElement) {
  //   subTaskElement.style.opacity = "0";
  //   await delay(500);
  //   subTaskElement.style.maxHeight = "0";
  //   subTaskElement.style.padding = "0";
  //   await delay(500);
  // }
  mainTask.tasks = mainTask.tasks.map((task) =>
    task.slNo === slNo ? subTask : task
  );

  //If user does not have this group
  if (!userTasks.value.find((group) => group.slNo === mainTask.slNo)) {
    let userTask = {
      ...mainTask,
      tasks: [subTask],
    };
    userTasks.value.push(userTask);
  } else {
    userTasks.value.find((group) => {
      if (group.slNo === mainTask.slNo) {
        group.tasks.push(subTask);
        return true;
      }
    });
  }
}

async function loadData() {
  const {
    data: items,
    refresh,
    error,
  } = await useFetch(`${config.public.api}/api/status`, {
    headers: {
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  const { data: taskData, error: taskError } = await useFetch(
    `${config.public.api}/api/tasks`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );

  if (taskError.value) {
    add({
      title: `Fetch Error ${taskError.value.statusCode}`,
      text: taskError.value.statusMessage,
      color: "red",
    });
    return;
  }
  userTasks.value = taskData.value.data.openGroups
    .filter(group => group.tasks.some(task => task.assigneeEmail === user.email && task.status !== 'closed'))
    .sort((a, b) => b.slNo - a.slNo);
  allTasks.value = taskData.value.data.recentGroups.sort(
    (a, b) => b.slNo - a.slNo
  );
  console.log(userTasks.value);
  console.log(allTasks.value);

  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    add({
      title: `Fetch Error ${error.value.statusCode}`,
      text: error.value.statusMessage,
      color: "red",
    });
    return;
  }
  if (items.value.statusCode === 200) {
    data.value = items.value.data;
    loadCharts();
    loading.value = false;
  }
}
loadData();
function loadCharts() {
  for (let i = 1; i <= 16; i++) {
    zoneGauge.value[i - 1] =
      data.value.filter(
        (d) =>
          d.CMS_status === "online" &&
          d[`Z${i}_bp`] !== "1" &&
          d["ZONE_" + i] === 1
      ).length || 0;
  }
}
io.connect();

io.on("taskAdd", (group, newTask) => {
  console.log(group, newTask);
  let foundGroup = allTasks.value.find((g) => g.slNo === group);

  if (foundGroup) {
    // If the group exists, add the new task to it
    foundGroup.tasks.push(newTask);
  } else {
    // If the group does not exist, create a new group with the new task
    allTasks.value.push({
      ...group,
      tasks: [newTask],
    });
  }
});

io.on("taskClaim", (group, taskSlNo, name, note) => {
  handleClaim(taskSlNo);

  // Replace the group in allTasks.value and userTasks if it matches group.slNo
  allTasks.value = allTasks.value.map((g) => g.slNo === group.slNo ? group : g);
  userTasks.value = userTasks.value.map((g) => g.slNo === group.slNo ? group : g);
});

io.on("taskClose", (group, taskSlNo) => {
  handleClose(group.slNo, taskSlNo);

  allTasks.value = allTasks.value.map((g) => g.slNo === group.slNo ? group : g);
  userTasks.value = userTasks.value.filter((g) => g.slNo !== group.slNo);
}); 
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
