<template>
  <div v-if="view" class="fixed top-0 bg-new-black/50 w-full h-screen flex">
    <div
      class="w-64 h-screen bg-new-blue/20 backdrop-blur-lg pt-8 pb-4 px-4 text-white flex flex-col gap-4"
    >
      <div class="flex justify-between mb-2">
        <span class="font-semibold text-xl">Filter by</span>
        <SVGClose
          class="text-white/80 hover:text-white cursor-pointer"
          :size="'32'"
          @click="view = false"
        />
      </div>
      <div class="flex flex-col gap-4 overflow-y-scroll">
        <CommonFilterSection
          v-for="c in categories"
          :key="c.name"
          :category="c"
          @update="(x) => filterChange(c.name, x)"
        />
      </div>
    </div>
    <div class="flex flex-1" @click="view = false"></div>
  </div>
</template>
<script setup>
import Zones from "@/data/zones";
const emit = defineEmits(["update"]);
const { data } = defineProps(["data"]);
const view = ref(false);
const filters = {};
const route = useRoute();
const queryString = route.query;
const config = useRuntimeConfig();
const categories = [
  {
    name: "Status",
    options: [
      {
        name: "Online",
        selected: false,
        filter: (device) => device.CMS_status === "online",
      },
      {
        name: "Offline",
        selected: false,
        filter: (device) => device.CMS_status === "offline",
      },
    ],
  },
  {
    name: "Mode",
    options: [
      {
        name: "Day",
        selected: false,
        filter: (device) => device.Op_Mode === "D",
      },
      {
        name: "Night",
        selected: false,
        filter: (device) => device.Op_Mode === "N",
      },
      {
        name: "Maintenance",
        selected: false,
        filter: (device) => device.Op_Mode === "M",
      },
      {
        name: "Low Battery",
        selected: false,
        filter: (device) => percentage(device.Bat_Voltage) <= 30,
      },
    ],
  },
  {
    name: "Connectivity",
    options: [
      {
        name: "Wi-Fi",
        selected: false,
        filter: (device) => device.Net_Con === "wifi",
      },
      {
        name: "Ethernet",
        selected: false,
        filter: (device) => device.Net_Con === "ethernet",
      },
      {
        name: "Cellular",
        selected: false,
        filter: (device) => device.Net_Con === "cellular",
      },
    ],
  },
  {
    name: "Zones",
    options: Array.from({ length: 16 }, (_, i) => {
      const zoneNumber = i + 1;
      return {
        name: `Zone ${zoneNumber}`,
        selected: false,
        filter: (device) =>
          device.CMS_status === 'online' && device[`Z${zoneNumber}_bp`] !== "1" && device[`ZONE_${zoneNumber}`] === 1,
      };
    }),
  },
  {
    name: "Hub",
    options: data
      ?.filter((device) => device.branch.Hub)
      .map((device) => {
        return {
          name: device.branch.Hub,
          selected: false,
          filter: (d) => d.branch.Hub === device.branch.Hub,
        };
      })
      .flat()
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name)
      ),
  },
  {
    name: "Vertical",
    options: data
      ?.filter((device) => device.branch.Vertical)
      .map((device) => {
        return {
          name: device.branch.Vertical,
          selected: false,
          filter: (d) => d.branch.Vertical === device.branch.Vertical,
        };
      })
      .flat()
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name)
      ),
  },
  {
    name: "Bypass Mode",
    options: [
      {
        name: "Enable",
        selected: false,
        filter: (d) => {
          return Object.entries(d).find(
            ([key, value]) => key.endsWith("_bp") && value === "1"
          );
        },
      },
    ],
  },
  {
    name: "Region",
    options: data
      ?.filter((device) => device.branch.Region)
      .map((device) => {
        return {
          name: device.branch.Region,
          selected: false,
          filter: (d) => d.branch.Region === device.branch.Region,
        };
      })
      .flat()
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name)
      ),
  },
];
function percentage(num) {
  return Math.round(
    (parseFloat(num || 0).toFixed(2) / config.public.batteryVoltage) * 100
  );
}
onMounted(() => {
  if (queryString) {
    for (let [key, value] of Object.entries(queryString)) {
      if (!Array.isArray(value)) {
        value = [value];
      }
      key = key.slice(0, -2);
      let index = categories.findIndex((x) => x.name === key);
      categories[index].options.forEach((option) => {
        if (value.includes(option.name)) {
          option.selected = true;
        }
      });
      let options = categories[index].options
        .filter((x) => x.selected)
        .map((option) => option.filter);
      filterChange(key, options);
    }
    console.log(queryString, categories);
  }
});

function toggleView() {
  view.value = !view.value;
}

function filterChange(name, options) {
  console.log(
    name,
    options.map((i) => i.toString())
  );
  if (options.length) {
    filters[name] = (device) => options.some((filter) => filter(device));
  } else {
    delete filters[name];
  }
  emit("update", Object.values(filters));
}

defineExpose({
  toggleView,
});
</script>
