<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl"
        >Network Information</span
      >
      <span class="opacity-80 font-light"
        >Enter the device network details</span
      >
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <div class="flex w-full">
        <CommonText
          :title="'IP Address'"
          @change="(value) => emit('update', value, 'IP_Address')"
          :data="data.device?.IP_Address"
          :validation="validate.ipAddress"
          :errorMessage="errorMessage.ipAddress"
          :placeholder="'0.0.0.0'"
          class="w-1/3 mr-2"
        />
        <CommonText
          :title="'Modem IP'"
          @change="(value) => emit('update', value, 'Modem_IP')"
          :data="data.device?.Modem_IP"
          :validation="validate.ipAddress"
          :errorMessage="errorMessage.ipAddress"
          :placeholder="'0.0.0.0'"
          class="w-1/3 mx-2"
        />
        <CommonText
          :title="'GSM Number'"
          @change="(value) => emit('update', value, 'GSM_Number')"
          :data="data.device?.GSM_Number"
          :placeholder="'97563 91003'"
          class="w-1/3 ml-2"
        />
      </div>
      <div class="flex w-full">
        <CommonText
          :title="'Wi-Fi SSID'"
          @change="(value) => emit('update', value, 'WIFI_SSID')"
          :data="data.device?.WIFI_SSID"
          :placeholder="'Kadavanthra'"
          class="w-1/3 mr-2"
        />
        <CommonText
          :title="'Password'"
          :type="'password'"
          :data="password"
          class="w-1/3 mx-2"
          @change="(x) => (password = x)"
        />
        <CommonText
          :title="'Retype Password'"
          :type="'password'"
          @change="(value) => emit('update', value, 'Password')"
          :validation="validate.password"
          :errorMessage="errorMessage.password"
          class="w-1/3 ml-2"
        />
      </div>
      <MasterCustomisedDropDown
        :title="'GSM Provider'"
        @update="(value) => emit('update', value, 'GSM_Provider')"
        :list="providers"
        :selectedChannel="data.device?.GSM_Provider"
        class="w-[32%]"
      />
    </div>
  </div>
</template>
<script setup>
const { data, providers } = defineProps(["data", "providers"]);
const emit = defineEmits(["update"]);
const password = ref(data.device?.Password || "");
const validate = ref({
  ipAddress: function (value) {
    return /^([0-9]{1,3}\.){3}[0-9]{1,3}$/i.test(value) ? true : false;
  },
  password: function (value) {
    return value === password.value ? true : false;
  },
});
const errorMessage = ref({
  ipAddress: "Invalid IP address format",
  password: "Passwords do not match",
});
</script>
