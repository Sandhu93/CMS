<template>
  <div
    class="h-12 mt-4 mx-4 bg-new-blue/10 rounded-l-lg flex items-center relative"
  >
    <!-- <SVGSearch class="text-white/60 ml-4" :size="'36'" /> -->
    <div
      class="bg-new-blue/10 flex w-1/6 h-full items-center justify-between pr-4 pl-2 rounded-l-lg cursor-pointer"
      @click="drop = !drop"
    >
      <h1 class="pl-5 text-white top-4 left-2">
        {{ selectedSearch }}
      </h1>
      <div class="ml-4 w-1/6 flex justify-end">
        <SVGDown
          :class="`text-white/60  ${
            drop ? 'rotate-180' : ''
          } transition-all duration-500 ease-in-out`"
          :size="'36'"
        />
      </div>
    </div>
    <div
      :class="`z-20 top-14 left-0 bg-transparent absolute backdrop-blur-lg  border-white/30 w-1/6 ${
        drop ? 'h-[120px] border' : 'h-0'
      } rounded-b-lg transition-all duration-500 ease-in-out overflow-hidden rounded-xl`"
    >
      <h1
        :class="`font-montserrat font-light border-white/30 border w-full h-10 flex items-center rounded-t-xl pl-5 cursor-pointer ${
          selectedSearch === 'Branch Name'
            ? 'text-new-blue bg-new-blue/10'
            : 'text-white'
        }`"
        @click="
          selectedSearch = 'Branch Name';
          emit('modeChange', 'Branch Name');
        "
      >
        Branch Name
      </h1>
      <h1
        :class="`font-montserrat font-light border-white/30 border w-full h-10 flex items-center pl-5 cursor-pointer ${
          selectedSearch === 'Branch Code'
            ? 'text-new-blue bg-new-blue/10'
            : 'text-white'
        }`"
        @click="
          selectedSearch = 'Branch Code';
          emit('modeChange', 'Branch Code');
        "
      >
        Branch Code
      </h1>
      <h1
        :class="`font-montserrat font-light  pl-5 cursor-pointer border-gray-600 border w-full h-10 flex items-center rounded-b-xl ${
          selectedSearch === 'Mac Id'
            ? 'text-new-blue bg-new-blue/10'
            : 'text-white'
        }`"
        @click="
          selectedSearch = 'Mac Id';
          emit('modeChange', 'Mac Id');
        "
      >
        Mac ID
      </h1>
    </div>

    <input
      class="flex-1 h-full bg-transparent outline-none rounded-lg p-4 text-white text-sm"
      v-model="searchParam"
      ref="search"
      @input="clearSearch()"
      @keypress="
        $event.key === 'Enter' &&
          searchParam !== '' &&
          emit('update', searchParam);
        updateSearchDrop();
      "
      :placeholder="`Enter the ${selectedSearch}`"
    />

    <button
      @click="
        emit('update', searchParam);
        updateSearchDrop();
      "
      class="w-64 h-full bg-new-blue/60 hover:bg-new-blue/80 rounded-r-lg text-white font-semibold"
    >
      Search
    </button>
  </div>
</template>
<script setup>
const searchParam = ref("");
const search = ref(null);
const emit = defineEmits(["update", "modeChange"]);
const drop = ref(false);
function clearSearch() {
  if (searchParam.value === "") emit("update", "");
}
const selectedSearch = ref("Branch Name");
function updateSearchDrop() {
  drop.value = false;
}

defineExpose({
  updateSearchDrop,
});
</script>
