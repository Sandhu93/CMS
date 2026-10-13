<template>
  <div
    :class="`${
      dropOpen ? 'z-30' : ''
    } rounded-lg ml-0 h-full border border-m-black`"
  >
    <div class="w-full bottom-2 h-full">
      <div class="flex justify-between h-full">
        <div class="w-full h-full">
          <div class="group relative h-full">
            <div
              id="dropdown"
              class="rounded-lg bg-white/10 text-white hover:bg-frosty-button active:bg-frosty-button h-full"
            >
              <div
                id="dropdown-stuff"
                class="h-full px-2 py-2 relative flex flex-col"
              >
                <span class="text-xs opacity-80 pl-2">{{ title }}</span>
                <div
                  id="default-stuff"
                  class="mt-auto w-full flex flex-row items-end cursor-pointer"
                  @click="toggleDrop"
                >
                  <div class="font-medium px-2">
                    {{ selectedChannel ? selectedChannel.name : "None" }}
                  </div>
                  <div class="text-gray-300 pl-1 ml-auto mr-1">
                    <SVGDown
                      :size="'30'"
                      :class="`scale-125 ${
                        dropOpen
                          ? 'transform rotate-180 transition duration-500'
                          : 'transition duration-500'
                      }`"
                    />
                  </div>
                </div>
                <div
                  id="choice-stuff"
                  :class="`z-40 bg-new-black/60 backdrop-blur-lg border border-gray-600 rounded-xl w-full divide-y divide-gray-600 overflow-y-scroll absolute flex flex-col items-start left-0 h-36 -bottom-[154px] ${
                    dropOpen ? 'block' : 'hidden'
                  }`"
                >
                  <div
                    v-for="item in list"
                    :key="item.value"
                    :class="`flex flex-row items-center ${
                      item.value ===
                      (selectedChannel ? selectedChannel.value : false)
                        ? 'bg-new-blue/10 text-new-blue '
                        : ''
                    }hover:bg-new-blue/10 px-1 py-2 w-full cursor-pointer`"
                    @click="chooseChannel(item)"
                  >
                    <div
                      class="flex flex-row h-full items-center justify-center pl-1"
                    ></div>
                    <div class="truncate text-sm font-medium px-1">
                      {{ item ? item.name : "None" }}
                    </div>
                    <div
                      :class="`text-gray-300 ml-auto${
                        item.value ===
                        (selectedChannel ? selectedChannel.value : false)
                          ? ''
                          : ' invisible'
                      }`"
                    >
                      <!-- <SVGDropSelected class="text-discortics-blue" /> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["update"]);
const { list, selected, title } = defineProps(["list", "selected", "title"]);

let selectedChannel = ref(
  list.find((x) => x.value === selected) || null
);

const dropOpen = ref(false);

function toggleDrop() {
  dropOpen.value = !dropOpen.value;
}
function chooseChannel(channel) {
  selectedChannel.value = channel;
  emit("update", selectedChannel.value);
  dropOpen.value = false;
}
</script>
