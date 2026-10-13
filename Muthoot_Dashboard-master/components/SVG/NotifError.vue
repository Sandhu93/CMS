<template>
  <svg :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.1667 3.5H19.0167H8.98333H5.83333C5.21449 3.5 4.621 3.74583 4.18342 4.18342C3.74583 4.621 3.5 5.21449 3.5 5.83333V8.98333V19.1333V22.1667C3.5 22.7855 3.74583 23.379 4.18342 23.8166C4.621 24.2542 5.21449 24.5 5.83333 24.5H8.98333H19.1333H22.1667C22.7855 24.5 23.379 24.2542 23.8166 23.8166C24.2542 23.379 24.5 22.7855 24.5 22.1667V19.0167V8.98333V5.83333C24.5 5.21449 24.2542 4.621 23.8166 4.18342C23.379 3.74583 22.7855 3.5 22.1667 3.5ZM18.2 19.8333L14 15.6333L9.8 19.8333L8.16667 18.2L12.3667 14L8.16667 9.8L9.8 8.16667L14 12.3667L18.2 8.16667L19.8333 9.8L15.6333 14L19.8333 18.2L18.2 19.8333Z" fill="white" fill-opacity="0.8" style="fill:white;fill:white;fill-opacity:0.8;"/>
    <path d="M18.2 19.8333L14 15.6333L9.8 19.8333L8.16667 18.2L12.3667 14L8.16667 9.8L9.8 8.16667L14 12.3667L18.2 8.16667L19.8333 9.8L15.6333 14L19.8333 18.2L18.2 19.8333Z" fill="currentColor" style="fill:currentColor;fill:currentColor;fill-opacity:1;"/>
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
