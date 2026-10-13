<template>
  <div class="flex flex-col h-screen bg-new-black bg-background font-quicksand bg-cover">
    <Header ref="headerRef" :title="route.path" />
    <main
      class="flex-1 h-full w-full overflow-y-scroll"
      @click="headerRef.hideNotif"
    >
      <CommonNotification />
      <CommonServerStatus :shouldConnect="true" />
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
const headerRef = ref(null);
</script>
