<template>
  <div
    :class="`w-full pb-2 mx-auto flex gap-1 relative pointer-events-auto`"
  >
    <div
      :class="`${
        color == 'green' ? 'text-m-green' : color == 'red' ? 'text-m-red' : 'text-yellow-600'
      } border-b border-white/30 px-4 pb-3 pt-1 w-full flex gap-3`"
    >
      <SVGNotifCheck v-if="color === 'green'" class="" />
      <!-- <SVGNotifError v-else-if="color === 'red'" class="text-m-black" /> -->
      <SVGNotifWarn v-else class="" />
      <div
        class="font-montserrat text-white flex flex-col w-full group cursor-pointer"
        @click="closeAndGoto(link)"
      >
        <div class="flex justify-between items-center">
          <span class="font-semibold tracking-wide">
            {{ title }}
          </span>
        </div>
        <span class="text-sm text-white/80 font-medium group-hover:underline">
          {{ text }}
        </span>
        <span class="text-xs mt-2 text-white/60 font-normal">
          {{ moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
const { color, text, title, id, link, timestamp } = defineProps([
  "color",
  "text",
  "title",
  "id",
  "link",
  "timestamp",
]);
import { useNotificationsStore } from "@/store/notifications";
import moment from 'moment';
const emit = defineEmits(["rmFromArray", "close"]);
const router = useRouter();
function closeAndGoto(link) {
  emit("close");
  router.push(link);
}
</script>
