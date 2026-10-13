<template>
  <div>
    <div class="group relative mb-2">
      <div
        class="rounded-md bg-transparent border-white/30 border hover:bg-white/10 active:bg-white/10"
      >
        <div
          id="default-stuff"
          class="my-auto w-full flex flex-row items-center cursor-pointer"
          @click="dropdown = !dropdown"
        >
          <div class="h-full items-center"></div>
          <div>
            <div
              v-if="permissionArray.length > 0"
              class="flex flex-row flex-wrap mb-2 pr-2"
            >
              <div v-for="(perm, index) in permissionArray" :key="index">
                <div class="text-md font-semibold pl-2">
                  <div class="mt-2 flex flex-row justify-center items-center">
                    <button
                      class="pl-2 bg-new-blue/10 text-new-blue rounded h-7 flex justify-between items-center"
                    >
                      <span class="text-sm font-montserrat font-light">{{
                        perm.replace(/([a-z])([A-Z])/g, "$1 $2")
                      }}</span>
                      <div
                        @click="
                          () =>
                            (permissionArray = permissionArray.filter(
                              (x) => x !== perm
                            ))
                        "
                      >
                        <SVGCloseCross size="18" class="mx-1.5" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="m-2 text-sm text-white/80">Select</div>
          </div>
          <div class="text-gray-300 pl-1 ml-auto mr-1">
            <SVGDown
              :class="`${
                dropdown
                  ? 'transform rotate-180 transition duration-500'
                  : 'transition duration-500'
              }`"
            />
          </div>
        </div>
        <div
          id="choice-stuff"
          :class="`z-30 bg-m-black-light/90 bg-new-black/60 backdrop-blur-lg border border-gray-600 rounded-xl w-full divide-y divide-gray-600 h-32 overflow-y-scroll absolute flex flex-col items-start -bottom-[132px] ${
            dropdown ? 'block' : 'hidden'
          }`"
        >
          <div
            v-for="(perm, index) in permissionsSplit"
            :key="index"
            :class="`flex flex-row items-center hover:bg-new-blue/10 px-1 py-2 w-full cursor-pointer ${
              permissionArray.find((x) => x === perm)
                ? 'bg-new-blue/10 text-new-blue'
                : ''
            }`"
            @click="
              () =>
                permissionArray.findIndex((x) => x === perm) === -1
                  ? permissionArray.push(perm)
                  : (permissionArray = permissionArray.filter(
                      (x) => x !== perm
                    ))
            "
          >
            <div
              class="flex flex-row h-full items-center justify-center pl-1"
            ></div>
            <div class="truncate text-sm font-normal px-1">
              {{ perm }}
            </div>
            <div
              :class="`text-new-blue ml-auto${
                permissionArray.find((x) => x === perm) ? '' : ' invisible'
              }`"
            >
              <SVGDropSelected />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { permission, permissions } = defineProps(["permission", "permissions"]);
console.log(permission, permissions);
const emit = defineEmits(["close"]);
const permissionArray = ref(permission || []);
const permissionsSplit = ref(
  permissions.map((x) => x.replace(/([a-z])([A-Z])/g, "$1 $2"))
);
let dropdown = ref(false);
let selected = ref([]);

// function save() {
//     emit("close", {
//         perms: permissionArray.value.map((x) => x.id),
//         broles: blacklistRoleData.value.map((x) => x.id),
//         wchans: whitelistChannelData.value.map((x) => x.id),
//         bchans: blacklistChannelData.value.map((x) => x.id),
//     });
// }
function close() {
  emit("close", false);
}
</script>
