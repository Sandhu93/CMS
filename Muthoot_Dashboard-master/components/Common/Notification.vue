<template>
  <div>
    <div
      :class="`fixed flex top-0 right-0 mr-4 h-screen ${
        notifications.length > 0 ? '' : 'hidden'
      } w-72 z-40 pointer-events-none animation-notification`"
    >
      <div
        class="flex flex-col box-border w-full mt-auto mb-[10%] h-[92%] overflow-y-auto pointer-events-none animate-notification-inner"
      >
        <CommonNotificationPopup
          v-for="item in notifications"
          :key="item.id"
          :id="item.id"
          :color="item.color || 'green'"
          :text="item.text"
          :title="item.title"
          :link="item.link"
        />
      </div>
    </div>
    <div
      :class="`fixed flex top-0 left-0 mr-4 h-screen ${
        critical.length > 0 ? '' : 'hidden'
      } w-screen bg-new-black/70 z-40 pointer-events-none animation-notification`"
    >
      <div
        class="flex flex-col-reverse box-border w-72 justify-center mx-auto overflow-y-auto pointer-events-none animate-notification-inner"
      >
        <CommonCriticalPopup
          v-for="item in critical"
          :key="item.id"
          :id="item.id"
          :color="item.color || 'red'"
          :text="item.text"
          :title="item.title"
          :link="item.link"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const { shouldConnect } = defineProps(["shouldConnect"]);
const { $io } = useNuxtApp();
const io = $io(localStorage.getItem("token"));
const notification = useNotificationsStore();
const notifications = computed(() => notification.notifications);
const critical = computed(() => notification.critical);
setInterval(() => {
  notification.clean();
}, 2500);
// if (shouldConnect) {
io.connect();
// }
let dueRefresh = false;
let dueInterval = null;
// io.on("connect", () => {
//   if(dueInterval) {
//     clearInterval(dueInterval);
//     dueInterval = null;
//   }
//   if(dueRefresh) {
//     window.location.reload();
//   }
//   notification.add({
//     title: "Server Online",
//     text: `Connected to server`,
//   });
// });
// io.on("disconnect", () => {
//   dueInterval = setTimeout(function(){
//     dueRefresh = true;
//   }, 5000);
//   notification.add({
//     title: "Server Offline",
//     text: `Disconnected from the server`,
//     color: "red",
//   });
// });
io.on("notification", (data) => {
  notification.add({
    title: data.title,
    text: data.message,
    color: data.color,
    link: data.link,
  });
});
</script>
