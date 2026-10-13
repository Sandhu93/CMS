<template>
  <div
    class="flex w-full bg-new-blue/10 p-1 transition-all ease-in-out duration-500 rounded-md"
  >
    <div
      @click="
        () => {
          emit('updateFilters');
          router.push(`/dashboard/status?Status[]=Online`);
        }
      "
      :class="`flex flex-col h-full rounded bg-gradient-to-r from-m-green/40 hover:from-m-green/60 items-center px-4 transition-all ease-in-out duration-500`"
      :style="`width: ${leftPercentage}%;`"
    >
      <span
        :class="`text-m-green text-2xl font-semibold ${
          rightPercentage === 0 ? '' : 'mr-auto'
        } h-[27px] transition-all ease-in-out duration-500`"
      >
        {{ data[1] }}
      </span>
      <span
        :class="`text-m-green text-xs ${
          rightPercentage === 0 ? '' : 'mr-auto'
        } transition-all ease-in-out duration-500`"
        >Online</span
      >
    </div>
    <div
      @click="
        () => {
          router.push(`/dashboard/status?Status[]=Offline`);
        }
      "
      :class="`flex flex-col h-full rounded bg-gradient-to-l from-m-red/40 hover:from-m-red/60 items-center px-4 transition-all ease-in-out duration-500`"
      :style="`width: ${rightPercentage}%;`"
    >
      <span
        :class="`text-m-red text-2xl font-semibold ${
          leftPercentage === 0 ? '' : 'ml-auto'
        } h-[27px] transition-all ease-in-out duration-500`"
      >
        {{ data[0] - data[1] }}
      </span>
      <span
        :class="`text-m-red text-xs ${
          leftPercentage === 0 ? '' : 'ml-auto'
        } transition-all ease-in-out duration-500`"
        >Offline</span
      >
    </div>
  </div>
</template>
<script setup>
const { data } = defineProps(["data"]);
const router = useRouter();
const emit = defineEmits(["updateFilters"]);
const leftPercentage = computed(() =>
  Math.floor((data[1] / data[0]) * 100) > 0
    ? Math.min(Math.floor((data[1] / data[0]) * 100), 90)
    : 10
);
const rightPercentage = computed( () => Math.min(100 - leftPercentage.value, 90));
// if(leftPercentage .value> 0) leftPercentage .value= Math.max(leftPercentage.value, 10);
// if(rightPercentage.value > 0) rightPercentage.value = Math.max(rightPercentage.value, 10);
</script>
