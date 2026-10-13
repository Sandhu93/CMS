<template>
  <div>
    <div :class="`fixed flex bottom-0 right-0 z-40 pointer-events-none animation-notification`" >
      <div class="flex flex-col box-border w-full overflow-y-auto pointer-events-none animate-notification-inner">
        <div :class="`${ status === 'online' ? 'bg-greenOpaque text-m-green' : 'bg-m-red/40 text-m-red' } px-6 py-2 flex items-center gap-3 rounded-tl-xl backdrop-blur`">
          <span class="relative flex h-3 w-3 mx-auto">
            <span :class="`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'offline'? 'bg-m-red': 'bg-m-green'} opacity-75`" ></span>
            <span :class="`relative inline-flex rounded-full h-3 w-3 ${ status === 'offline' ? 'bg-m-red' : 'bg-m-green'}`" ></span>
          </span>
          <span class="font-semibold">{{ status === 'offline' ? 'Offline' : 'Online'  }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const { shouldConnect } = defineProps(["shouldConnect"]);
const { $io } = useNuxtApp();
const io = $io(localStorage.getItem("token"));
if (shouldConnect) {
  io.connect();
}
const status = ref('offline');
let dueRefresh = false;
let dueInterval = null;
io.on("connect", () => {
  // if(dueInterval) {
  //   clearInterval(dueInterval);
  //   dueInterval = null;
  // }
  // if(dueRefresh) {
  //   window.location.reload();
  // }
  status.value = 'online';
});
io.on("disconnect", () => {
  // dueInterval = setTimeout(function(){
  //   dueRefresh = true;
  // }, 5000);
  status.value = "offline";
});
</script>
