<template>
  <div
    class="relative flex h-20 w-full bg-new-blue/10 border-b-2 border-new-blue/30 items-center justify-between pl-6 pr-8 text-white"
  >
    <div
      class="flex items-center justify-between w-full h-[105%] max-w-screen-2xl mx-auto pr-8 pl-6"
    >
      <img src="/icon.png" class="h-10 w-10" />
      <div class="h-full flex">
        <div
          v-for="header in headers"
          @click="goto(header.link)"
          :key="header.title"
          :class="`${
            header.link && title.startsWith(header.link)
              ? 'text-new-blue border-b-2 border-new-blue bg-gradient-to-b from-transparent to-new-blue/50'
              : ''
          } ${
            !header.link
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:text-new-blue'
          } flex h-full px-6 items-center`"
        >
          <span>{{ header.displayName }}</span>
        </div>
      </div>
      <div class="flex gap-8 items-center">
        <SVGNotification
          :class="`cursor-pointer hover:text-new-blue z-40 ${
            showNotification ? 'text-new-blue' : ''
          }`"
          @click="showNotification = !showNotification"
        />
        <div
          v-if="showNotification"
          class="absolute top-16 right-20 bg-new-blue/10 backdrop-blur-lg rounded-xl w-96 h-72 overflow-y-auto border-4 border-new-blue/10 z-30"
        >
          <div
            class="flex justify-between z-40 px-4 py-3 items-center sticky top-0 mb-2"
            style="
              background: linear-gradient(
                  0deg,
                  rgba(48, 230, 255, 0.1) 0%,
                  rgba(48, 230, 255, 0.1) 100%
                ),
                #000814;
            "
          >
            <h1 class="text font-montserrat font-semibold text-white">
              Notifications
            </h1>
            <SVGReload
              class="text-white/60 cursor-pointer hover:text-white"
              @click="loadNotification"
            />
          </div>
          <CommonNotificationDrop
            v-for="item in notifications"
            :key="item._id"
            :id="item._id"
            :color="item.color || 'green'"
            :text="item.message"
            :title="item.title"
            :link="item.link"
            @close="showNotification = false"
          />
          <div v-if="!endOfLog" class="w-full flex flex-col items-center px-5">
            <div v-if="loadMoreDrop" class="animate-pulse w-full">
              <div class="w-full h-[50px] bg-m-black-light my-1"></div>
              <div class="w-full h-[50px] bg-m-black-light"></div>
              <div class="w-full h-[50px] bg-m-black-light my-1"></div>
              <div class="w-full h-[50px] bg-m-black-light my-1"></div>
              <div class="w-full h-[50px] bg-m-black-light my-1"></div>
            </div>
            <h1
              @click="loadMore"
              class="text-white mt-2 mb-4 cursor-pointer flex justify-center items-center rounded-xl"
            >
              Load More
              <SVGDown
                :class="`${
                  loadMoreDrop ? 'rotate-180' : ''
                } transition-all ease-in-out duration-500`"
              />
            </h1>
          </div>
        </div>
        <div class="relative">
          <div
            class="flex gap-2 items-center hover:text-new-blue"
            @click="showDrop = !showDrop"
          >
            <p class="cursor-pointer">Hi, {{ user.name || "User" }}</p>
            <SVGDown
              :class="`transition-all duration-300 ${
                showDrop ? 'rotate-180' : ''
              }`"
            />
          </div>
          <div
            v-if="showDrop"
            class="absolute top-9 right-0 bg-new-blue/10 backdrop-blur-lg rounded-xl overflow-y-auto border-2 border-new-blue/10 z-30"
          >
            <h1
              class="text font-montserrat text-white px-8 py-4 hover:text-m-red cursor-pointer"
              @click="logout"
            >
              Logout
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "~/store/notifications";

const { title } = defineProps(["title"]);
const router = useRouter();
const config = useRuntimeConfig();
const showNotification = ref(false);
const showDrop = ref(false);
const endOfLog = ref(false);
const pageNumber = ref(1);
const loadMoreDrop = ref(false);
const notifications = ref(null);
const user = JSON.parse(localStorage.getItem("user"));
console.log("User", user);
const filterRequest = ref("?page[size]=5&page[number]=1");
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  router.push("/");
}
function goto(path) {
  router.push(path);
}
const loadNotification = async () => {
  const { data, error } = await useFetch(
    `${config.public.api}/api/notifications${filterRequest.value}`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  notifications.value = data.value.data;
};

async function loadMore() {
  loadMoreDrop.value = !loadMoreDrop.value;
  pageNumber.value++;
  let requestQuery = `?page[size]=5&page[number]=${pageNumber.value}`;
  const { data, error } = await useFetch(
    `${config.public.api}/api/notifications${requestQuery}`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  loadMoreDrop.value = !loadMoreDrop.value;
  if (data.value.data.length < 5) {
    endOfLog.value = true;
    return;
  }
  notifications.value = [...notifications.value, ...data.value.data];
}

const hideNotif = () => {
  showNotification.value = false;
};

const permissions = localStorage.getItem("permissions");
const headers = [
  {
    displayName: "Home",
    link: "/dashboard/home",
    title: "home",
    permissionRequired: null,
  },
  {
    displayName: "Status",
    link: "/dashboard/status",
    title: "status",
    permissionRequired: ["ViewStatus,"],
  },
  {
    displayName: "Alerts",
    link: "/dashboard/alerts",
    title: "alerts",
    permissionRequired: null,
  },
  {
    displayName: "Backlogs",
    link: "/dashboard/backlogs",
    title: "backlogs",
    permissionRequired: null,
  },
  {
    displayName: "Master",
    link: "/dashboard/master",
    title: "master",
    permissionRequired: null,
  },
  {
    displayName: "Reports",
    link: "/dashboard/reports",
    title: "reports",
    permissionRequired: ["ViewHistory,", "ViewAttendance,"],
  },
  {
    displayName: "SOS",
    link: "",
    title: "",
    permissionRequired: null,
  },
  {
    displayName: "Admin",
    link: "/dashboard/admin",
    title: "admin",
    permissionRequired: ["ViewUsers,", "ViewRoles,"],
  },
  {
    displayName: "Settings",
    link: "/dashboard/settings",
    title: "settings",
    permissionRequired: null,
  },
].filter((header) => {
  if (header.permissionRequired === null) return true;
  else {
    for (let i = 0; i < header.permissionRequired.length; i++) {
      if (permissions && permissions.includes(header.permissionRequired[i]))
        return true;
    }
    return false;
  }
});
loadNotification();

defineExpose({
  hideNotif,
});
</script>
