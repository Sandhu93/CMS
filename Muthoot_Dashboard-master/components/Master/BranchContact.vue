<template>
    <div class="w-full flex">
        <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
            <span class="font-montserrat font-semibold text-xl">Contact Information</span>
            <span class="opacity-80 font-light">Enter the emergency contact details</span>
        </div>
        <div class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2">
            <CommonText @change="(value) => emit('update', value, 'Contact_Person')" :title="'Contact Name'" :data="dataRef.branch?.Contact_Person" :placeholder="'John Doe'" class="w-full mr-2"/>
            <div class="flex w-full">
                    <CommonText @change="(value) => emit('update', value, 'Mail_Address')" :title="'Email'" :type="'email'" :data="dataRef.branch?.Mail_Address" :placeholder="'johndoe@example.com'" :validation="validate.email" :errorMessage="errorMessage.email" class="w-1/2 mr-2"/>
                    <CommonText @change="(value) => emit('update', value, 'Mobile_Number')" :title="'Mobile Number'" :data="dataRef.branch?.Mobile_Number" :validation="validate.phoneNumber" :errorMessage="errorMessage.phoneNumber" :placeholder="'+91 99954 28310'" class="w-1/2 ml-2"/>
            </div>
            <div class="flex w-full">
                    <CommonText @change="(value) => emit('update', value, 'Branch_Land_Phone')" :title="'Branch Landline'" :data="dataRef.branch?.Branch_Land_Phone" :validation="validate.landLine" :errorMessage="errorMessage.landLine" :placeholder="'0484 2765704'" class="w-1/2 mr-2"/>
                    <CommonText @change="(value) => emit('update', value, 'Branch_Mobile')" :title="'Branch Mobile'" :data="dataRef.branch?.Branch_Mobile" :validation="validate.Branch_Mobile" :errorMessage="errorMessage.phoneNumber" :placeholder="'+91 99954 28310'" class="w-1/2 ml-2"/>
            </div>
        </div>
    </div>
</template>
<script setup>
    const { data } = defineProps(["data"]);
    const emit = defineEmits(["update"]);
    const dataRef = ref(data || {});
    const validate = ref({
        email: function(value) {
            return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(value) ? true : false;
        },
        phoneNumber: function(value) {
            return /^(\+[0-9]{1,5})?(\s+)?[0-9]{10}$/i.test(value) ? true : false;
        },
        landLine: function(value) {
            return /^[0-9]{9,15}$/i.test(value) ? true : false;
        },
    });
    const errorMessage = ref({
        email: "Invalid email address format",
        phoneNumber: "Invalid phone number format",
        landLine: "Invalid landline number format",
    });
</script>