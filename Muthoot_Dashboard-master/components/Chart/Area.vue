<template>
  <div class="m-0">
    <apexchart
      ref="realtimeChart"
      type="area"
      height="160px"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>
<script setup>
import moment from "moment";
const config = useRuntimeConfig();
const realtimeChart = ref(null);
const oldDate = moment().subtract(30, 'days');
const days = Array.from({ length: 30 }, (v, i) => oldDate.add(1, 'days').startOf('day').toISOString());
const data = ref({});
const loading = ref(true);
const series = [
  {
    name: "No. Offline Devices",
    data: Array.from({length: 30}, () => 0),
  },
];
const chartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    type: "area",
  },
  colors: ["#FF5252"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 3,
    curve: "smooth",
  },
  grid: {
    borderColor: "#555",
    clipMarkers: false,
    yaxis: {
      lines: {
        show: false
      }
    },
    xaxis: {
      lines: {
        show: true
      }
    },
  },
  xaxis: {
    type: "datetime",
    categories: days,
    labels: {
      format: "dd MMM",
      style: {
        colors: "#FFFFFF",
        fontSize: "10px",
        fontFamily: "Montserrat",
        fontWeight: 400,
        cssClass: "apexcharts-xaxis-label",
      },
    },
    axisTicks: {
      show: false
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#FFFFFF",
        fontSize: "10px",
        fontFamily: "Montserrat",
        fontWeight: 400,
        cssClass: "apexcharts-xaxis-label",
      },
    },
    axisTicks: {
      show: false
    },
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
  },
};
async function loadData() {
    const { data, error } = await useFetch(
      `${config.public.api}/api/offlineChart`,
      {
          headers: {
              authorization: `${localStorage.getItem("token")}`,
          },
      }
    );
    if(data.value && data.value.statusCode === 200){
        // series.value = data.value.data;
        console.log(data.value.data);
        series[0].data = Object.values(data.value.data.map((d) => d.count));
        realtimeChart.value.updateSeries(series);
        console.log(realtimeChart.value.series)
        chartOptions.xaxis.categories = Object.keys(data.value.data);
        loading.value = false;
    }
    if (error.value) {
        if (error.value.statusCode === 401) {
            setTimeout(() => {
                // auth.clear();
                router.push("/");
            }, 5000);
        }
        add({
            title: `Fetch Error ${error.value.statusCode}`,
            text: error.value.statusMessage,
            color: "red",
        });
        return;
    }
}
loadData();
</script>
