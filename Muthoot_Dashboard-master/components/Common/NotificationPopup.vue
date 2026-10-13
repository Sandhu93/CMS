<template>
  <div
    :class="`w-full pb-2 mx-auto flex gap-1 relative z-50 pointer-events-auto`"
  >
    <div
      :class="`${
        color == 'green'
          ? 'bg-greenOpaque'
          : color == 'red'
          ? 'bg-m-red/40'
          : 'bg-yellow-600/70'
      } backdrop-blur rounded-md drop-shadow-2xl px-4 py-3 w-full flex gap-3`"
    >
      <SVGNotifCheck v-if="color === 'green'" class="text-white" />
      <!-- <SVGNotifError v-else-if="color === 'red'" class="text-white" /> -->
      <SVGNotifWarn v-else class="text-white" />
      <div
        class="font-montserrat text-white flex flex-col w-full group cursor-pointer"
        @click="router.push(link)"
      >
        <div class="flex justify-between items-center">
          <span class="font-semibold tracking-wide">
            {{ title }}
          </span>
        </div>
        <span class="text-sm text-white/80 font-normal whitespace-pre-line group-hover:underline">
          {{ text }}
        </span>
      </div>
      <SVGCloseCross
        class="ml-auto text-white/80 hover:text-white cursor-pointer"
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
