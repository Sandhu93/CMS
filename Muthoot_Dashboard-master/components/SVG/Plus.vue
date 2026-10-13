<template>
  <svg :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
  </svg>
</template>
<script>
export default {
  props: {
    size: {
      type: String,
      default() {
        return "32";
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
