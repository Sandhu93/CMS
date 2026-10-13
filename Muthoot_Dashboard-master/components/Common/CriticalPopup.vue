<template>
  <div
    :class="`w-full pb-2 mx-auto flex gap-1 relative z-50 pointer-events-auto`"
  >
    <div
      :class="`${
        color == 'green'
          ? 'bg-m-green/40'
          : color == 'red'
          ? 'bg-m-red/70'
          : 'bg-yellow-600/70'
      } backdrop-blur-lg rounded-md drop-shadow-2xl px-3 pt-6 pb-3 w-full flex flex-col relative items-center`"
    >
      <SVGNotifWarn size="100" class="text-white" />
      <div
        class="font-montserrat text-white flex flex-col items-center text-xl w-full group cursor-pointer"
        @click="router.push(link)"
      >
        <div class="flex justify-between items-center">
          <span class="font-semibold tracking-wide text-lg text-center mb-2">
            {{ title }}
          </span>
        </div>
        <span class="text-sm text-white/80 whitespace-pre-line font-normal group-hover:text-yellow-400 bg-red-900 w-full p-4 rounded">
          {{ text }}
        </span>
      </div>
      <SVGCloseCross
        class="absolute top-2 right-2 text-white/80 hover:text-white cursor-pointer"
        :size="'42'"
        @click="remove(id)"
      />
    </div>
  </div>
</template>
<script setup>
const { color, text, title, id, link } = defineProps([
  "color",
  "text",
  "title",
  "id",
  "link",
]);
import { useNotificationsStore } from "@/store/notifications";
const emit = defineEmits(["rmFromArray"]);
const { remove } = useNotificationsStore();
const router = useRouter();
</script>
