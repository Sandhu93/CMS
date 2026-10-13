<template>
  <div class="h-full flex items-center justify-around flex-wrap pb-4">
    <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]" :key="i" class="text-center text-white">
      <div :class="`h-12 w-12 border font-bold transition-transform duration-200 hover:-translate-y-3 hover:scale-110 ${zoneGauge[i-1] ? 'bg-m-red border-m-red/30 text-new-black' : 'bg-new-blue/30 border-new-blue/30 text-new-blue'}  flex items-center justify-center rounded`" @click="
        () => {
          emit('sendModalData', 'ZONE_'+i);
          router.push('/dashboard/status/?Zones[]=Zone%20'+i);
        }">
        <span>{{ zoneGauge[i-1] || 0 }}</span>
      </div>
      <span class="text-xs">Z{{ i }}</span>
    </div>
    <!-- <ChartCircularGauge
      :data="zoneGauge[0]"
      :total="total"
      name="Zone 1"
      ref="zone1"
      @click="
        () => {
          emit('sendModalData', 'ZONE_1');
          router.push('/dashboard/status/?Zones[]=Zone%201');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[1]"
      :total="total"
      name="Zone 2"
      ref="zone2"
      @click="
        () => {
          emit('sendModalData', 'ZONE_2');
          router.push('/dashboard/status/?Zones[]=Zone%202');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[2]"
      :total="total"
      name="Zone 3"
      ref="zone3"
      @click="
        () => {
          emit('sendModalData', 'ZONE_3');
          router.push('/dashboard/status/?Zones[]=Zone%203');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[3]"
      :total="total"
      name="Zone 4"
      ref="zone4"
      @click="
        () => {
          emit('sendModalData', 'ZONE_4');
          router.push('/dashboard/status/?Zones[]=Zone%204');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[4]"
      :total="total"
      name="Zone 5"
      ref="zone5"
      @click="
        () => {
          emit('sendModalData', 'ZONE_5');
          router.push('/dashboard/status/?Zones[]=Zone%205');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[5]"
      :total="total"
      name="Zone 6"
      ref="zone6"
      @click="
        () => {
          emit('sendModalData', 'ZONE_6');
          router.push('/dashboard/status/?Zones[]=Zone%206');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[6]"
      :total="total"
      name="Zone 7"
      ref="zone7"
      @click="
        () => {
          emit('sendModalData', 'ZONE_7');
          router.push('/dashboard/status/?Zones[]=Zone%207');
        }
      "
    />
    <ChartCircularGauge
      :data="zoneGauge[7]"
      :total="total"
      name="Zone 8"
      ref="zone8"
      @click="
        () => {
          emit('sendModalData', 'ZONE_8');
          router.push('/dashboard/status/?Zones[]=Zone%208');
        }
      "
    /> -->
    <!-- <ChartCircularGauge
      :data="zoneGauge[i]"
      :total="total"
      :name="`Zone ${i + 1}`"
      v-for="(item, i) in zoneGauge"
      :key="item.id"
    /> -->
  </div>
</template>
<script setup>
const { zoneGauge, total } = defineProps(["zoneGauge", "total"]);
const emit = defineEmits(["sendModalData"]);
const router = useRouter();
// const zone1 = ref(null);
// const zone2 = ref(null);
// const zone3 = ref(null);
// const zone4 = ref(null);
// const zone5 = ref(null);
// const zone6 = ref(null);
// const zone7 = ref(null);
// const zone8 = ref(null);

function updateGauge() {
  // zone1.value.updateChart(zoneGauge[0]);
  // zone2.value.updateChart(zoneGauge[1]);
  // zone3.value.updateChart(zoneGauge[2]);
  // zone4.value.updateChart(zoneGauge[3]);
  // zone5.value.updateChart(zoneGauge[4]);
  // zone6.value.updateChart(zoneGauge[5]);
  // zone7.value.updateChart(zoneGauge[6]);
  // zone8.value.updateChart(zoneGauge[7]);
}
defineExpose({
  updateGauge,
});
</script>
