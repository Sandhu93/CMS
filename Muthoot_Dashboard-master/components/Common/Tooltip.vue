<template>
    <div class="relative inline-flex" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">
        <slot/>
        <div v-if="showTooltip" class="z-20 group max-w-xs absolute -top-7" :style="'left: 50%;transform: translate(-50%, 0);'">
            <div class="">
                <div class="h-6 px-2 py-1 text-xs font-normal truncate relative bg-gray-900 text-white rounded shadow ring-1 ring-gray-800">
                    {{ text }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    const { text } = defineProps(["text"]);
    const showTooltip = ref(false);
</script>