<template>
  <div class=" max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Filter -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
    </div>
    <div v-else class="flex flex-col h-full w-full text-white gap-4 pb-16">
      <div
        class="flex flex-col w-full px-16 py-8 justify-between items-center sticky top-0 z-10"
      >
        <div class="flex flex-col mr-auto ml-16 mb-8">
          <span class="font-montserrat font-semibold text-2xl"
            >Edit Settings</span
          >
          <span class="opacity-80 font-light">Edit your user settings</span>
        </div>

        <div class="w-full flex">
          <div
            class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10"
          >
            <span class="font-montserrat font-semibold text-xl"
              >Profile Information</span
            >
            <span class="opacity-80 font-light"
              >Modify your personal information</span
            >
          </div>
          <div
            class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
          >
            <div class="flex w-full">
              <CommonText
                :title="'Name'"
                :data="data.name"
                @change="name = $event"
                :placeholder="'John Doe'"
                class="w-1/2 mr-2"
              />
              <CommonText
                :title="'Role'"
                :placeholder="'Admin'"
                :data="data.role"
                :disabled="true"
                class="w-1/2 ml-2"
              />
            </div>

            <CommonText
              :title="'Email'"
              :placeholder="'something@example.com'"
              :data="data.email"
              :disabled="true"
              class="w-[49%]"
            />

            <div class="flex w-full">
              <div
                class="bg-new-blue/80 text-black font-semibold w-40 h-10 hover:bg-new-blue cursor-pointer px-6 py-2 rounded-lg mt-2 flex justify-center items-center"
                @click="submit('Name')"
              >
                <SVGLoading v-if="submitting" />
                <span v-else>Save Changes</span>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full flex">
          <div
            class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10"
          >
            <span class="font-montserrat font-semibold text-xl"
              >Change Password</span
            >
            <span class="opacity-80 font-light">Modify your password</span>
          </div>
          <div
            class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
          >
            <div class="flex w-full">
              <CommonText
                :title="'Old Password'"
                :placeholder="'***************'"
                @change="passwords.old = $event"
                :type="'password'"
                class="w-[49%]"
              />
            </div>
            <div class="flex w-full">
              <CommonText
                :title="'New Password'"
                :placeholder="'***************'"
                @change="passwords.new = $event"
                :type="'password'"
                class="w-1/2 mr-2"
              />
              <CommonText
                :title="'Re-Type New password'"
                :placeholder="'***************'"
                @change="passwords.confirm = $event"
                :type="'password'"
                class="w-1/2 ml-2"
              />
            </div>
            <div class="flex w-full">
              <div
                class="bg-new-blue/80 text-black font-semibold w-40 h-10 hover:bg-new-blue cursor-pointer px-6 py-2 rounded-lg mt-2 flex justify-center items-center"
                @click="submit('Pass')"
              >
                <SVGLoading v-if="submitting" />
                <span v-else>Save Changes</span>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full flex mt-4">
          <div
            class="flex flex-col w-1/2 ml-16 pr-4 py-4 border-b-2 border-white/10"
          >
            <span class="font-montserrat font-semibold text-xl"
              >Authentication</span
            >
            <span class="opacity-80 font-light"
              >Setup and manage your 2FA settings</span
            >
          </div>
          <div
            class="flex flex-col w-1/2 py-4 border-b-2 border-white/10 pl-4 mr-16 gap-2"
          >
            <div class="flex w-full">
              <CommonText
                :title="'2FA Status'"
                :data="data.mfaEnabled ? 'Enabled' : 'Disabled'"
                :placeholder="'Disabled'"
                :disabled="true"
                class="w-full"
              />
            </div>
            <div class="flex w-full gap-3 text-black font-semibold">
              <div
                class="bg-new-blue/80 hover:bg-new-blue cursor-pointer px-6 py-2 rounded-lg mt-2"
                @click="showMFA = true"
              >
                {{ !data.mfaEnabled ? "Setup 2FA" : "Re-setup 2FA" }}
              </div>
              <div
                v-if="data.mfaEnabled"
                class="bg-new-blue/80 hover:bg-new-blue cursor-pointer px-6 py-2 rounded-lg mt-2"
              >
                Disable
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SettingsMFA v-if="showMFA" @close="showMFA = false" :data="data" />
    <CommonPopup ref="popup" />
  </div>
</template>
<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Settings`,
});
const notification = useNotificationsStore();
const { add } = notification;
const popup = ref(null);

const data = ref(null);
const name = ref(null);
const loading = ref(true);
const submitting = ref(false);
const showMFA = ref(false);
const passwords = ref({
  old: null,
  new: null,
  confirm: null,
});
const emailRegex = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
const passUpperRegex = new RegExp(".*[A-Z].*");
const passLowerRegex = new RegExp(".*[a-z].*");
const passSpecialRegex = new RegExp("/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g");
const passDigitRegex = new RegExp(".*[0-9].*");
const passEightRegex = new RegExp(".{8,}");
async function submit(type) {
  submitting.value = true;
  if (type === "Name") {
    const { data, error } = await useFetch(`${config.public.api}/api/user`, {
      method: "POST",
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: name.value,
      }),
    });
    if (error.value) {
      add({
        title: `${error.value.data.statusCode} ${
          error.value.data.statusMessage || error.value.data.statusText
        }`,
        color: "red",
      });
      submitting.value = false;
    } else if (data.value) {
      add({
        title: "Settings Updated!",
        color: "green",
      });
      submitting.value = false;
    }
  } else if (type === "Pass") {
    if (
      !passwords.value.new ||
      !passwords.value.old ||
      !passwords.value.confirm
    ) {
      add({
        title: "Please fill all the fields!",
        color: "red",
      });
      submitting.value = false;
      return;
    }
    if (passwords.value.new != passwords.value.confirm) {
      popup.value.update("Password doesn't match!", "red");
      return;
    }
    if (!passUpperRegex.test(passwords.value.new)) {
      popup.value.update(
        "Please include an uppercase letter in your password.",
        "red"
      );
      return;
    }
    if (!passLowerRegex.test(passwords.value.new)) {
      popup.value.update(
        "Please include a lowercase letter in your password.",
        "red"
      );
      return;
    }
    if (!passDigitRegex.test(passwords.value.new)) {
      popup.value.update("Please include a digit in your password.", "red");
      return;
    }
    if (!passEightRegex.test(passwords.value.new)) {
      popup.value.update(
        "Please include atleast 8 characters in your password.",
        "red"
      );
      return;
    }
    const { data, error } = await useFetch(
      `${config.public.api}/api/userPassword`,
      {
        method: "POST",
        headers: {
          authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          password: passwords.value.old,
          newPassword: passwords.value.new,
        }),
      }
    );
    if (error.value) {
      add({
        title: `${error.value.data.statusCode} ${
          error.value.data.statusMessage || error.value.data.statusText
        }`,
        color: "red",
      });
      submitting.value = false;
    } else if (data.value) {
      add({
        title: "Settings Updated!",
        color: "green",
      });
      submitting.value = false;
    }
  }
}

async function loadData() {
  const { data: user, error } = await useFetch(
    `${config.public.api}/api/user`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    return;
  }
  if (user.value.statusCode === 200) {
    data.value = user.value.data;
    name.value = data.value.name;
    loading.value = false;
  }
}
loadData();
</script>
