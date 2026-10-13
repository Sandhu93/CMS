<template>
  <div>
    <apexchart
      width="250px"
      height="250px"
      type="donut"
      :options="options"
      :series="series"
    ></apexchart>
  </div>
</template>
<script setup>
const options = {
  colors: ["#AA50ED", "#4D5CDB", "#0CA9D1", "#FCDD51", "#FEA047", "#F4557A"],
  stroke: {
    show: false,
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 0.7,
      },
    },
    active: {
      allowMultipleDataPointsSelection: true,
      filter: {
        type: "darken",
        value: 0.3,
      },
    },
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      dataLabels: {
        minAngleToShowLabel: 10,
      },
      donut: {
        labels: {
          show: true,
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: "40px",
            fontFamily: "Montserrat",
            fontWeight: 600,
            color: "#FFFFFF",
          },
          total: {
            show: true,
            showAlways: true,
            fontSize: "22px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 600,
            color: "#000000",
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => {
                return a + b;
              }, 0);
            },
          },
        },
      },
    },
  },
  dataLabels: {
    style: {
      fontSize: "13px",
      fontFamily: "Montserrat",
      fontWeight: "bold",
      colors: ["#000000"],
    },
    formatter: function (val) {
      return val.toFixed(0) + "%";
    },
    dropShadow: {
      enabled: false,
    },
  },
  labels: [
    "Panic Button",
    "Keypad",
    "Battery",
    "Shutter Contact",
    "Hooter",
    "Panel",
  ],
  legend: {
    show: false,
  },
  tooltip: {
    enabled: false,
  },
};
const { pieData } = defineProps(["pieData"]);
const series = pieData;
</script>
