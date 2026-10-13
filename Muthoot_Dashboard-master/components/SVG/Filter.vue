<template>
    <svg :width="width * 0.75 || size  * 0.75"
      :height="height * 0.75 || size  * 0.75" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.213 0H4.78705C2.56478 0 1.23928 2.49021 2.47198 4.34933L9.78303 14.0757C10.3924 14.9948 10.7176 16.0747 10.7176 17.1793V24.5984C10.7176 25.8446 12.2161 26.4687 13.0925 25.5875L15.8749 22.79C16.1358 22.5277 16.2824 22.1719 16.2824 21.8009V17.1793C16.2824 16.0747 16.6076 14.9948 17.217 14.0757L24.528 4.34933C25.7607 2.49021 24.4352 0 22.213 0Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
  </svg>
</template>
<script>

export default {
  props: {
    size: {
      type: String,
      default() {
        return '40'
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