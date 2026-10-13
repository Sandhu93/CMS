<template>
  <svg :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5417 14.5833H11.4584V9.37501H13.5417M13.5417 18.75H11.4584V16.6667H13.5417M1.04175 21.875H23.9584L12.5001 2.08334L1.04175 21.875Z" fill="currentColor" fill-opacity="0.8" style="fill:currentColor;fill:currentColor;fill-opacity:0.8;"/>
<path d="M13.5417 14.5833H11.4584V9.37501H13.5417V14.5833Z" fill="black" style="fill:black;fill:black;fill-opacity:1;"/>
<path d="M13.5417 18.75H11.4584V16.6667H13.5417V18.75Z" fill="black" style="fill:black;fill:black;fill-opacity:1;"/>
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
