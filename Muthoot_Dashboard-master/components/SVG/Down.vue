<template>
    <svg :width="width * 0.75 || size  * 0.75"
      :height="height * 0.75 || size  * 0.75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.90027 8L12.0862 14.186L18.2722 8L20.1725 9.91374L12.0862 18L4 9.91374L5.90027 8Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
</svg>

</template>
<script>

export default {
  props: {
    size: {
      type: String,
      default() {
        return '24'
      },
    },
    width: {
      type: String,
      default() {
        return null
      },
    },
    height: {
      type: String,
      default() {
        return null
      },
    },
  },
}
</script>