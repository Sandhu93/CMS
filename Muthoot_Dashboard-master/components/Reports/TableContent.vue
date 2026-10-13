<template>
  <tr
    :key="key"
    :class="`bg-new-blue/10 rounded-lg border-b-4 border-white/10 hover:bg-new-blue/20`"
  >
    <td class="py-3 capitalize text-center font-light">
      {{ moment.utc(item.timestamp).format("DD MMM YY hh:mm A") }}
    </td>
    <td class="py-3 capitalize pl-8">
      {{ item.mac_id }}
    </td>
    <td class="py-3 capitalize pl-8 text-center">
      {{ branch || "--" }}
    </td>
    <td class="py-3 capitalize">
      <span
        :class="`py-2 px-4 mx-auto text-center rounded w-32 block ${
          item.level !== 'warning'
            ? item.level !== 'critical'
              ? item.level !== 'info'
                ? 'bg-m-red/10'
                : 'bg-sky-300/10 text-sky-300'
              : 'bg-m-red/10 text-m-red'
            : 'bg-m-yellow/10 text-m-yellow'
        }`"
      >
        {{ item.level }}
      </span>
    </td>
    <td
      v-html="processMessage(item.message)"
      class="py-3 font-normal text-white/80"
    ></td>
    <td class="py-3 capitalize">
      {{ item.duration ? dateFormat(item.duration) : "Unknown" }}
    </td>
  </tr>
</template>
<script setup>
const { item, key, branch } = defineProps(["item", "key", "branch"]);
import moment from "moment";
import { h } from "vue";
const VNode = () => h("div", { class: props.class, innerHTML: props.HTML });
function processMessage(message) {
  let msg = message.split(" ");
  for (let i = 0; i < msg.length; i++) {
    if (!msg[i].includes(":")) continue;
    let [k, value] = msg[i].split(":");
    let typ = "font-normal";
    let color = "text-white";
    if (k[0] == "b") {
      typ = "font-bold";
    }
    if (k[1] == "G") {
      color = "text-m-green";
    } else if (k[1] == "Y") {
      color = "text-m-yellow";
    } else if (k[1] == "R") {
      color = "text-m-red";
    }
    msg[i] = `<span class="${typ} ${color}">${value}</span>`;
  }
  msg[0] = msg[0] + ":";
  return msg.join(" ");
}

function dateFormat(time1) {
  let dateList = [];
  let hh = time1 / 1000;
  let yrr = Math.floor(hh / 31104000);
  if (yrr) dateList.push(yrr + (yrr === 1 ? " year" : " years"));
  let months = Math.floor(hh / 2592000) % 12;
  if (months) dateList.push(months + (months === 1 ? " month" : " months"));
  let days = Math.floor(hh / 86400) % 30;
  if (dateList.length < 2 && days)
    dateList.push(days + (days === 1 ? " day" : " days"));
  let hours = Math.floor(hh / 3600) % 24;
  if (dateList.length < 2 && hours)
    dateList.push(hours + (hours === 1 ? " hour" : " hours"));
  let mints = Math.floor(hh / 60) % 60;
  if (dateList.length < 2 && mints)
    dateList.push(mints + (mints === 1 ? " minute" : " minutes"));
  let minutes = Math.floor(hh % 60);
  if (dateList.length < 2 && minutes)
    dateList.push(minutes + (minutes === 1 ? " second" : " seconds"));
  dateList = dateList.join(" ");
  return dateList ? dateList : "1 second";
}
</script>
