<template>
    <div class="flex items-center">
        <div :class="`${ index > 0 ? 'bg-new-blue/80 text-new-black' : 'bg-white/10'} font-bold font-montserrat w-10 h-10 items-center flex justify-center rounded-lg`">
            <span>1</span>
        </div>
        <div :class="`w-12 border-2 h-1 ${index > 1 ? 'border-new-blue/80' : 'border-white/10'}`"></div>
        <div :class="`${ index > 1 ? 'bg-new-blue/80 text-new-black' : 'bg-white/10'} font-bold font-montserrat w-10 h-10 items-center flex justify-center rounded-lg`">
            <span>2</span>
        </div>
    </div>
</template>
<script setup>
    const { index } = defineProps(["index"]);
</script>