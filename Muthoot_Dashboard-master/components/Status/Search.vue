<template>
  <div class="h-12 mt-4 mx-4 bg-new-blue/10 rounded-lg flex items-center">
    <SVGSearch class="text-white/60 ml-4" :size="'36'" />
    <input
      class="flex-1 h-full bg-transparent outline-none rounded-lg p-4 text-white text-sm"
      v-model="searchParam"
      ref="search"
      @input="clearSearch()"
      @keypress="
        $event.key === 'Enter' &&
          searchParam !== '' &&
          emit('update', searchParam)
      "
      placeholder="Enter a Branch Name or Mac ID or Branch Code"
    />
    <button
      @click="emit('update', searchParam)"
      class="w-64 h-full bg-new-blue/80 hover:bg-new-blue/90 rounded-r-lg text-black font-semibold"
    >
      Search
    </button>
  </div>
</template>
<script setup>
const searchParam = ref("");
const search = ref(null);
const emit = defineEmits(["update"]);
function clearSearch() {
  if (searchParam.value === "") emit("update", "");
}
</script>
