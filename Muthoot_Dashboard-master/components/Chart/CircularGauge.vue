<template>
  <div
    class="m-0 relative hover:bg-white hover:bg-opacity-5 rounded-lg w-[100px] h-[100px]"
  >
    <apexchart
      class="absolute -right-[10px]"
      type="radialBar"
      :options="chartOptions"
      :series="chartSeries"
      width="120px"
      height="120px"
      ref="chart"
    />
  </div>
</template>

<script setup>
const { data, total, name } = defineProps(["data", "total", "name"]);
let dataRef = ref(data);
let chart = ref(null);
dataRef.value = [Math.floor((data / total) * 100)] || [0];
const chartOptions = {
  chart: {
    type: "radialBar",
    sparkline: {
      enabled: false,
    },
  },
  colors: ["#30E6FF"],
  grid: {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: "30%",
      },
      track: {
        background: "#ffffff1a",
        startAngle: -90,
        endAngle: 90,
      },
      dataLabels: {
        name: {
          offsetY: 20,
          show: true,
          color: "#FFFFFF",
          fontSize: "12px",
          fontWeight: "medium",
          fontFamily: "Montserrat",
        },
        value: {
          formatter: function (val) {
            val = Math.round((val * total) / 100);
            return val;
          },
          color: "#FFFFFF",
          offsetY: -15,
          fontSize: "17px",
          fontWeight: "bold",
          fontFamily: "Montserrat",
        },
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      gradientToColors: ["#BCF1FF"],
      stops: [0, 100],
    },
  },
  stroke: {
    lineCap: "butt",
  },
  labels: [name || "Zone"],
};
const chartSeries = [dataRef.value];
const updateChart = (value) => {
  chart.value.updateSeries([Math.floor((value / total) * 100)], 1000);
};
defineExpose({
  updateChart,
});
</script>
