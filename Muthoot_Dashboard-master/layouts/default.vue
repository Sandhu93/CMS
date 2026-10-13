<template>
  <div class="flex h-screen bg-new-black bg-background bg-cover">
    <main class="w-full">
      <CommonNotification :shouldConnect="false" />
      <slot />
    </main>
  </div>
</template>
