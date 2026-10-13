<template>
    <div class="bg-black/20 text-sm hover:bg-black/30 p-2 w-32 h-12 rounded-lg flex gap-2 items-center relative cursor-pointer" @click="changeMode">
            <span :class="`font-semibold absolute ${!statusRef ? 'delay-500' : 'scale-0'} ml-6 transition-all ease-in-out duration-200`">Night</span>
            <div :class="`p-0.5 rounded-lg ${ statusRef ? 'bg-m-yellow/10' : 'bg-white/10 translate-x-20'} transition-all duration-1000 ease-in-out flex items-center`">
                <SVGSun :class="`text-m-yellow ${!statusRef ? 'w-0 h-0' : ''} transition-all duration-500 ease-in-out`" :size="'800'"/>
                <SVGMoon :class="`text-white ${statusRef ? 'w-0 h-0' : ''} transition-all duration-500 ease-in-out`" :size="'800'"/>
            </div>
            <span :class="`font-semibold ${statusRef ? 'delay-500' : 'scale-0'} transition-all ease-in-out duration-200 ml-2`">Day</span>
    </div>
</template>
<script setup>
    const config = useRuntimeConfig();
    const { status, macID } = defineProps(["status", "macID"]);
    const statusRef = ref(status);
    async function changeMode() {
        const { data, error } = await useFetch( `${config.public.api}/api/changeMode/${macID}/${statusRef.value ? 'N' : 'D' }`, {
            headers: {
                authorization: `${localStorage.getItem("token")}`,
            },
        });
        statusRef.value = !statusRef.value;
    }
</script>