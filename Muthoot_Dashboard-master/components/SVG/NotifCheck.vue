<template>
  <svg :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.6667 4C9.25 4 4 9.25 4 15.6667C4 22.0833 9.25 27.3333 15.6667 27.3333C22.0833 27.3333 27.3333 22.0833 27.3333 15.6667C27.3333 9.25 22.0833 4 15.6667 4ZM13.3333 21.5L7.5 15.6667L9.145 14.0217L13.3333 18.1983L22.1883 9.34333L23.8333 11L13.3333 21.5Z" fill="currentColor" fill-opacity="0.8" style="fill:currentColor;fill:currentColor;fill-opacity:0.8;"/>
<path d="M13.3333 21.5L7.5 15.6667L9.145 14.0217L13.3333 18.1983L22.1883 9.34333L23.8333 11L13.3333 21.5Z" fill="black" style="fill:black;fill:black;fill-opacity:1;"/>
</svg>


</template>
<script>
export default {
  props: {
    size: {
      type: String,
      default() {
        return "40";
      },
    },
    width: {
      type: String,
      default() {
        return null;
      },
    },
    height: {
      type: String,
      default() {
        return null;
      },
    },
  },
};
</script>
