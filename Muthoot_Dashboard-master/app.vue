<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<!-- <script setup lang="ts">
  const state = ref(0);
  const { $io } = useNuxtApp();
  $io.connect();
  state.value = 100;
  $io.on('data', (data) => {
    console.log("Data received");
  })

</script> -->
