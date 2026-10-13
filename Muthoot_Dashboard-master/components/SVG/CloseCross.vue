<template>
  <svg :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.7671 7.51107L17.8571 4.60107L12.7671 9.69107L7.67709 4.60107L4.76709 7.51107L9.85709 12.6011L4.76709 17.6911L7.67709 20.6011L12.7671 15.5111L17.8571 20.6011L20.7671 17.6911L15.6771 12.6011L20.7671 7.51107Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
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
