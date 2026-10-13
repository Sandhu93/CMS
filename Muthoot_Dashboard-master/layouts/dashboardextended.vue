<template>
  <div class="flex flex-col min-h-screen bg-m-black font-quicksand">
    <Header :title="route.path.split('/').reverse()[0]" />
    <main class="flex-1 h-full w-full">
      <CommonNotification />
      <CommonServerStatus />
      <slot />
    </main>
    <!-- <div
      v-if="showServer"
      class="fixed top-0 left-0 z-50 w-full h-full flex justify-center"
    > -->
    <!-- </div> -->
  </div>
</template>
<script setup>
const route = useRoute();

</script>
