<template>
  <div class="h-12 mt-4 w-56">
    <!-- Filter -->
    <div class="flex h-full items-center relative">
      <div
        class="flex items-center justify-between cursor-pointer bg-new-blue/10 rounded-lg py-2 pl-6 pr-4 gap-4 w-full"
        @click="drop = !drop"
      >
        <h1 class="font-montserrat font-light text-white text-sm">{{selectedType || 'Type'}}</h1>
        <SVGDown
          :class="`text-white/60 ml-4  transition-all duration-500 ease-in-out ${
            drop ? 'rotate-180' : ''
          } `"
          :size="'36'"
        />
      </div>
      <div
        :class="`absolute z-20 flex flex-col justify-center  rounded-xl top-12 left-0 bg-transparent backdrop-blur-lg  border-white/30 w-full ease-in-out transition-all duration-500  ${
          drop ? 'h-32 border' : 'h-0 overflow-hidden opacity-0'
        }`"
      >
        <h1
          :class="`pl-5 font-montserrat cursor-pointer h-8 w-full rounded-t-xl flex items-center border-white/30 border-b ${
            selectedType === 'Mode Change'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedType = 'Mode Change';
            drop = !drop;
            dropCustom = false;
            updateType(selectedType);
          "
        >
          Mode Change
        </h1>
        <h1
          :class="`pl-5 font-montserrat cursor-pointer h-8 w-full rounded-t-xl flex items-center border-white/30 border-b ${
            selectedType === 'Zone Triggers'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedType = 'Zone Triggers';
            drop = !drop;
            dropCustom = false;
            updateType(selectedType);
          "
        >
          Zone Triggers
        </h1>
        <h1
          :class="`pl-5 font-montserrat cursor-pointer h-8 w-full rounded-t-xl flex items-center border-white/30 border-b ${
            selectedType === 'Zone Bypass'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedType = 'Zone Bypass';
            drop = !drop;
            dropCustom = false;
            updateType(selectedType);
          "
        >
          Zone Bypass
        </h1>
        <h1
          :class="`pl-5 font-montserrat cursor-pointer h-8 w-full rounded-t-xl flex items-center ${
            selectedType === 'All'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedType = 'All';
            drop = !drop;
            dropCustom = false;
            updateType(selectedType);
          "
        >
          All
        </h1>
      </div>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["updateType"]);
const drop = ref(false);
const dropCustom = ref(false);
const selectedType = ref("All");
function updateTypeDrop() {
  drop.value = false;
  dropCustom.value = false;
}
function updateType(selectedType) {
  emit("updateType", selectedType);
}
defineExpose({
  updateTypeDrop,
});
</script>
<!-- -->
