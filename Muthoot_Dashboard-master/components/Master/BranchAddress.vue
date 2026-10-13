<template>
  <div class="w-full flex">
    <div class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10">
      <span class="font-montserrat font-semibold text-xl">Branch Address</span>
      <span class="opacity-80 font-light">Enter the branch address</span>
    </div>
    <div
      class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
    >
      <CommonText
        @change="(value) => emit('update', value, 'Building_Name')"
        :title="'Building Name'"
        :data="data.branch?.Building_Name"
        :placeholder="'Kadavanthra'"
        class="w-full"
      />
      <div class="flex w-full">
          <CommonText
            @change="(value) => emit('update', value, 'City')"
            :title="'City'"
            :data="data.branch?.City"
            :placeholder="'Kadavanthra'"
            class="w-1/3 mr-2"
          />
          <CommonText
            @change="(value) => emit('update', value, 'Post_Office')"
            :title="'Post Office'"
            :data="data.branch?.Post_Office"
            :placeholder="'Kadavanthra'"
            class="w-1/3"
          />
          <CommonText
            @change="(value) => emit('update', value, 'Branch_Locality')"
            :title="'Branch Locality'"
            :data="data.branch?.Branch_Locality"
            :placeholder="'EKM'"
            class="w-1/3 ml-2"
          />
      </div>
      <div class="flex w-full">
        <CommonText
          @change="(value) => pincodeHandle(value)"
          type="number"
          :title="'Pincode'"
          :data="data.branch?.Pin_Code"
          :placeholder="'KOD'"
          :validation="validate.pincode"
          :errorMessage="errorMessage.pincode"
          class="w-1/4"
          ref="pincodeRef"
        />
        <div class="w-3/4 flex">
          <CommonText
            :title="'District'"
            :data="data.branch?.District || data?.District"
            :placeholder="'Ernakulam'"
            :disabled="true"
            class="w-1/2 ml-2"
            ref="district"
          />
          <CommonText
            :title="'State'"
            :data="data.branch?.State || data?.State"
            :placeholder="'Kerala'"
            :disabled="true"
            class="w-1/2 ml-2"
            ref="state"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const { data } = defineProps(["data"]);
const emit = defineEmits(["update"]);
const pincodeRef = ref(null);
const district = ref(null);
const state = ref(null);
const notification = useNotificationsStore();
const { add } = notification;

const validate = ref({
  pincode: function (value) {
    return /^[0-9]{6}$/i.test(value) ? true : false;
  },
});
const errorMessage = ref({
  pincode: "Invalid pincode format",
});

if(data && data.branch?.Pin_Code && (!data.branch?.District || !data.branch?.State)) {
  pincodeHandle(data.branch.Pin_Code);
}

async function pincodeHandle(pincode) {
  if (pincode === null) {
    emit("update", null, "Pin_Code");
    emit("update", null, "District");
    emit("update", null, "State");
    return;
  }
  if (pincode > 99999 && !isNaN(pincode)) {
    const { data: apiData, error } = await useFetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    if (apiData.value?.[0] && apiData.value[0].Status === "Success") {
      district.value.edit(apiData.value[0].PostOffice[0].District);
      state.value.edit(apiData.value[0].PostOffice[0].State);
      emit("update", pincode, "Pin_Code");
      emit("update", apiData.value[0].PostOffice[0].District, "District");
      emit("update", apiData.value[0].PostOffice[0].State, "State");
    }
    if (apiData.value[0].Status === "Error") {
      add({
        title: "Invalid pincode",
        text: "The entered pincode "+pincode+" is invalid",
        color: "red",
      });
      pincodeRef.value.edit("");
      district.value.edit("");
      state.value.edit("");
      emit("update", null, "Pin_Code");
      emit("update", null, "District");
      emit("update", null, "State");
    }
  }
}
</script>
