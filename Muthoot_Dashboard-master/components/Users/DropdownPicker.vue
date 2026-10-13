<template>
  <div :class="`w-full ${dropOpen ? 'z-30' : ''} rounded ml-0`">
    <div class="w-full bottom-2">
      <div class="w-full flex justify-between">
        <div class="w-full">
          <div class="group relative">
            <div
              id="dropdown"
              class="rounded bg-white/10 text-white hover:bg-frosty-button active:bg-frosty-button"
            >
              <div
                id="dropdown-stuff"
                class="h-10 relative flex flex-col items-center"
              >
                <div
                  id="default-stuff"
                  class="my-auto w-full flex flex-row items-center cursor-pointer"
                  @click="toggleDrop"
                >
                  <div class="text-sm font-medium px-2">
                    {{ selectedChannel ? selectedChannel.name : "None" }}
                  </div>
                  <div class="text-gray-300 pl-1 ml-auto mr-1">
                    <SVGDown
                      :class="`${
                        dropOpen
                          ? 'transform rotate-180 transition duration-500'
                          : 'transition duration-500'
                      }`"
                    />
                  </div>
                </div>
                <div
                  id="choice-stuff"
                  :class="`z-40 bg-new-black/60 backdrop-blur-3xl border border-gray-600 rounded-xl w-full divide-y divide-gray-600 overflow-y-scroll absolute flex flex-col items-start top-11 ${
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
                      <SVGDropSelected class="text-new-blue" />
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
const { list, selected } = defineProps(["list", "selected"]);

const selectedChannel = ref(
  selected
    ? list.find(
        (x) => x.value === (typeof selected === "string" ? selected : selected)
      )
    : null
);
console.log(selectedChannel.value, selected);
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
