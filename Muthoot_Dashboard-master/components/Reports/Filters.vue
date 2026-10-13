<template>
  <div class="h-12 mt-4 mx-4 w-max">
    <!-- TimeStamp Filter -->
    <div class="flex h-full items-center relative">
      <div
        class="flex items-center cursor-pointer bg-new-blue/10 rounded-lg py-2 pl-6 pr-4 gap-4"
        @click="drop = !drop"
      >
        <h1 class="font-montserrat font-light text-white text-sm">
          Time Period
        </h1>
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
          :class="`pl-5 font-montserrat cursor-pointer h-8 w-full rounded-t-xl flex items-center ${
            selectedTimestamp === 'Past Day'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedTimestamp = 'Past Day';
            drop = !drop;
            dropCustom = false;
            updateTimestamp(selectedTimestamp);
          "
        >
          Past Day
        </h1>
        <h1
          :class="`pl-5 font-montserrat cursor-pointer border-t border-white/30 h-8 w-full flex items-center ${
            selectedTimestamp === 'Past Week'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedTimestamp = 'Past Week';
            drop = !drop;
            dropCustom = false;
            updateTimestamp(selectedTimestamp);
          "
        >
          Past Week
        </h1>
        <div class="relative">
          <h1
            :class="`pl-5 font-montserrat cursor-pointer border-t border-white/30 h-8 w-full flex items-center ${
              selectedTimestamp === 'Custom'
                ? 'text-new-blue bg-new-blue/10'
                : 'text-white'
            }`"
            @click="
              selectedTimestamp = 'Custom';
              dropCustom = !dropCustom;
            "
          >
            Custom
          </h1>
          <div :class="`top-5 left-24 ${dropCustom ? 'absolute' : 'hidden'}`">
            <VDatePicker v-model.range="range" mode="dateTime" />
          </div>
        </div>
        <h1
          :class="`pl-5 font-montserrat cursor-pointer border-t border-white/30 h-8 w-full flex items-center rounded-b-xl ${
            selectedTimestamp === 'All Time'
              ? 'text-new-blue bg-new-blue/10'
              : 'text-white'
          }`"
          @click="
            selectedTimestamp = 'All Time';
            drop = !drop;
            dropCustom = false;
            updateTimestamp(selectedTimestamp);
          "
        >
          All Time
        </h1>
      </div>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(["updateTimestamp"]);
const drop = ref(false);
const dropCustom = ref(false);
const range = ref({
  start: "",
  end: "",
});
const selectedTimestamp = ref("All Time");
function updateTimestampDrop() {
  drop.value = false;
  dropCustom.value = false;
}
function updateTimestamp(selectedTimestamp) {
  if (selectedTimestamp === "Past Day") {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    emit("updateTimestamp", oneDayAgo.toISOString(), "Past Day");
  } else if (selectedTimestamp === "Past Week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    emit("updateTimestamp", oneWeekAgo.toISOString(), "Past Week");
  } else {
    emit("updateTimestamp", "", "All Time");
  }
}
defineExpose({
  updateTimestampDrop,
});
watch(range, (newVal) => {
  let rangeValue = {
    start: new Date(newVal.start).toISOString(),
    end: new Date(newVal.end).toISOString(),
  };
  emit("updateTimestamp", rangeValue, "Custom");
});
</script>
<!-- -->
