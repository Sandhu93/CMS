<template>
  <svg
    :width="width * 0.75 || size * 0.75"
    :height="height * 0.75 || size * 0.75"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="10" fill="white" fill-opacity="0.1" />
    <path
      d="M31 33H20V19H31M31 17H20C19.4696 17 18.9609 17.2107 18.5858 17.5858C18.2107 17.9609 18 18.4696 18 19V33C18 33.5304 18.2107 34.0391 18.5858 34.4142C18.9609 34.7893 19.4696 35 20 35H31C31.5304 35 32.0391 34.7893 32.4142 34.4142C32.7893 34.0391 33 33.5304 33 33V19C33 18.4696 32.7893 17.9609 32.4142 17.5858C32.0391 17.2107 31.5304 17 31 17ZM28 13H16C15.4696 13 14.9609 13.2107 14.5858 13.5858C14.2107 13.9609 14 14.4696 14 15V29H16V15H28V13Z"
      fill="white"
    />
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
