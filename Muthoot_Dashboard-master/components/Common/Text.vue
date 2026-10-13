<template>
    <div>
        <div :class="`w-full h-18 rounded-lg py-1 px-3 ${ disabled ? 'bg-white bg-opacity-[0.04] cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'} ${valid ? 'border border-m-green/80' : 'border border-transparent'}`">
            <span class="text-xs opacity-80">{{ title }}</span>
            <input v-model="input" :placeholder="placeholder" :type="typeRef" :readonly="disabled" :class="`w-full h-8 outline-none bg-transparent rounded-lg ${ disabled ? 'cursor-not-allowed' :''}`" @input="change"/>
        </div>
        <span v-if="error" class="mt-1 text-xs opacity-80 gap-1 text-new-blue flex items-center"><SVGError :size="'20'"/>{{ errorMessage }}</span>
    </div>
</template>
<script setup>
    const { data, title, placeholder, disabled, type, errorMessage, validation } = defineProps(["data", "title", "placeholder", "disabled", "type", "validation", "errorMessage"]);
    const emit = defineEmits(["change"]);
    const typeRef = ref(type || "text");
    const input = ref(data || "");
    if (type=='number'){
        input.value = Number(input.value)
    }
    const error = ref(false);
    const valid = ref(false);
    function change() {
        if(input.value === "") {
            error.value = false;
            valid.value = false;
            emit("change", null);
            return;
        }
        if(validation){
            error.value = !validation(input.value);
            valid.value = !error.value;
            if(error.value) return;
        }
        valid.value = true;
        emit("change",input.value);
    }

    function edit(value) {
        input.value = value;
    }

    defineExpose({ edit });
</script>