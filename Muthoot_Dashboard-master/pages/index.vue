<template>
  <div
    class="w-screen h-screen flex justify-center items-center bg-center bg-no-repeat max-w-screen-2xl mx-auto"
  >
    <div class="w-1/2 flex justify-center items-center">
      <div
        class="w-[450px] h-auto bg-new-blue rounded-2xl p-10 pb-0 flex flex-col justify-between bg-opacity-[0.15]"
      >
        <div>
          <div class="flex gap-5">
            <div class="flex flex-col items-center w-full mt-4 my-2">
              <h1 class="text-white font-bold text-5xl font-montserrat">
                LOGIN
              </h1>
              <h1 class="text-white/50 font-quicksand text-xs mt-3">
                A Secure Monitoring Vault
              </h1>
              <h1 class="text-white/50 font-quicksand text-xs">
                Initiative by Muthoot Private Limited
              </h1>
            </div>
          </div>
        </div>
        <div v-if="!twoFA && !setPassword" class="mt-5 text-white font-quicksand">
          <h1 class="text-md pb-1">Username</h1>
          <input
            type="text"
            v-model="details.username"
            style="outline: none"
            class="w-full h-12 rounded-md bg-white/10 border-[1px] border-white/30 p-5"
          />
          <h1 class="text-md pb-1 pt-5">
            Password
          </h1>
          <input
            type="password"
            style="outline: none"
            v-model="details.password"
            @keydown.enter="handleSubmit()"
            class="w-full h-12 rounded-md bg-white/10 border-[1px] border-white/30 p-5"
          />
          <div
            :class="`${
              details.password.length && details.username.length ? 'hover:bg-new-blue' : 'disabled opacity-50'
            } w-full h-12 bg-new-blue/80 text-new-black font-semibold rounded-md justify-center flex items-center mt-5 cursor-pointer transition-all ease-in-out duration-500`"
            @click="handleSubmit()
            "
          >
            <SVGLoading v-if="loadingCheck" />
            <span v-else>LOGIN</span>
          </div>
        </div>
        <div v-else-if="twoFA" class="mt-5 text-white font-quicksand">
          <h1 class="text-md pb-1 pt-5">Enter your 2FA Code</h1>
          <input
            type="text"
            style="outline: none"
            v-model="twoFAValue"
            class="w-full h-12 rounded-md bg-white/10 border-[1px] border-white/30 p-5"
            @keydown.enter="handleTwoFA()"
          />
          <div
            :class="`${
              twoFAValue.length ? 'hover:bg-new-blue' : 'disabled opacity-50'
            } w-full h-12 bg-new-blue/80 text-new-black font-semibold rounded-md justify-center flex items-center mt-5 cursor-pointer transition-all ease-in-out duration-500`"
            @click="handleTwoFA()"
          >
            <SVGLoading v-if="loadingCheck" />
            <span v-else>LOGIN</span>
          </div>
        </div>
        <div v-else-if="setPassword" class="mt-5 text-white font-quicksand">
          <h1 class="text-md pb-1 pt-5">
            Reset your password
          </h1>
          <h1 class="text-md pb-1 pt-5">New Password</h1>
          <input
            type="password"
            style="outline: none"
            v-model="passwordValue"
            class="w-full h-12 rounded-md bg-white/10 border-[1px] border-white/30 p-5"
            @keydown.enter="handleSetPassword()"
          />
          <h1 class="text-md pb-1 pt-5">
            Retype New Password
          </h1>
          <input
            type="password"
            style="outline: none"
            v-model="passwordValueRetype"
            class="w-full h-12 rounded-md bg-white/10 border-[1px] border-white/30 p-5"
            @keydown.enter="handleSetPassword()"
          />
          <div
            :class="`${
              passwordValue.length && passwordValueRetype.length ? 'hover:bg-new-blue' : 'disabled opacity-50'
            } w-full h-12 bg-new-blue/80 text-new-black font-semibold rounded-md justify-center flex items-center mt-5 cursor-pointer transition-all ease-in-out duration-500`"
            @click="handleSetPassword()"
          >
            <SVGLoading v-if="loadingCheck" />
            <span v-else>LOGIN</span>
          </div>
        </div>
        <div class="mb-5">
          <h1
            class="text-white font-quicksand text-sm text-center mt-5 cursor-default"
          >
            <span
              class="cursor-pointer transition-all ease-in-out duration-300 hover:text-new-blue"
              >Forgot Password</span
            >
            &nbsp;|&nbsp;
            <span
              class="cursor-pointer transition-all ease-in-out duration-300 hover:text-new-blue"
              >Contact Admin</span
            >
          </h1>
          <h1
            class="text-white/50 font-quicksand text-xs text-center mt-5 cursor-default"
          >
            © 2023 Vexvo
          </h1>
        </div>
      </div>
    </div>
    <div class="w-1/2 flex items-center justify-center">
      <SVGLogin class="w-fit" />
    </div>

    <CommonPopup ref="popup" />
  </div>
</template>
<script setup>
const config = useRuntimeConfig();
useHead({
  title: `Finance-Guard CMS`,
});
const details = ref({
  username: "",
  password: "",
});
const popup = ref(null);
const twoFAValue = ref("");
const passwordValue = ref("");
const passwordValueRetype = ref("");
const loadingCheck = ref(false);
const twoFA = ref(false);
const router = useRouter();
const setPassword = ref(false);
const emailRegex = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
const passUpperRegex = new RegExp(".*[A-Z].*");
const passLowerRegex = new RegExp(".*[a-z].*");
const passSpecialRegex = new RegExp("/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g");
const passDigitRegex = new RegExp(".*[0-9].*");
const passEightRegex = new RegExp(".{8,}");
async function handleSetPassword() {
  if (details.value.username && passwordValue.value) {
    if (passwordValue.value != passwordValueRetype.value) {
      popup.value.update("Password doesn't match!", "red");
      return;
    }
    if (!passUpperRegex.test(passwordValue.value)) {
      popup.value.update(
        "Please include an uppercase letter in your password.",
        "red"
      );
      return;
    }
    if (!passLowerRegex.test(passwordValue.value)) {
      popup.value.update(
        "Please include a lowercase letter in your password.",
        "red"
      );
      return;
    }
    if (!passDigitRegex.test(passwordValue.value)) {
      popup.value.update("Please include a digit in your password.", "red");
      return;
    }
    if (!passEightRegex.test(passwordValue.value)) {
      popup.value.update(
        "Please include atleast 8 characters in your password.",
        "red"
      );
      return;
    }
    loadingCheck.value = true;
    console.log(localStorage.getItem("token"));
    const { data, error } = await useFetch(
      `${config.public.api}/api/userPassword`,
      {
        method: "POST",
        body: JSON.stringify({
          password: details.value.password,
          newPassword: passwordValue.value,
        }),
        headers: {
          "Content-Type": "application/json",
          authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    if (error.value) {
      popup.value.update(
        `${error.value.data.statusCode} ${
          error.value.data.statusMessage || error.value.data.statusText
        }`,
        "red"
      );
      if (error.value.statusCode === 404) details.value.username = "";
      details.value.password = "";
      loadingCheck.value = false;
    } else if (data.value) {
      popup.value.update("Password Reset!.", "green");
      setTimeout(function () {
        router.push("/dashboard");
        twoFA.value = false;
      }, 2000);
    }
  }
}

async function handleTwoFA() {
  if (details.value.username && details.value.password) {
    loadingCheck.value = true;
    const { data, error } = await useFetch(
      `${config.public.api}/api/loginMFA`,
      {
        method: "POST",
        body: JSON.stringify({ ...details.value, token: twoFAValue.value }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (error.value) {
      popup.value.update(
        `${error.value.data.statusCode} ${
          error.value.data.statusMessage || error.value.data.statusText
        }`,
        "red"
      );
      if (error.value.statusCode === 404) twoFAValue.value ="";
      loadingCheck.value = false;
    } else if (data.value) {
      localStorage.setItem("token", data.value.user.token);
      localStorage.setItem("user", JSON.stringify(data.value.user));
      localStorage.setItem("permissions", data.value.user.permissions + ",");
      setTimeout(function () {
        router.push("/dashboard");
        twoFA.value = false;
      }, 2000);
    }
  }
}

async function handleSubmit() {
  if (details.value.username && details.value.password) {
    loadingCheck.value = true;
    const { data, error } = await useFetch(`${config.public.api}/api/login`, {
      method: "POST",
      body: JSON.stringify(details.value),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (error.value) {
      popup.value.update(
        `${error.value.data.statusCode} ${
          error.value.data.statusMessage || error.value.data.statusText
        }`,
        "red"
      );
      if (error.value.statusCode === 404) details.value.username = "";
      details.value.password = "";
      loadingCheck.value = false;
    } else if (data.value) {
      console.log(data.value);
      if (data.value.statusMessage === "setPassword") {
        localStorage.setItem("token", data.value.user.token);
        localStorage.setItem("user", JSON.stringify(data.value.user));
        localStorage.setItem("permissions", data.value.user.permissions + ",");
        setPassword.value = true;
        loadingCheck.value = false;
      } else if (data.value.mfa) {
        twoFA.value = true;
        loadingCheck.value = false;
      } else {
        localStorage.setItem("token", data.value.user.token);
        localStorage.setItem("user", JSON.stringify(data.value.user));
        localStorage.setItem("permissions", data.value.user.permissions + ",");
        setTimeout(function () {
          router.push("/dashboard");
          twoFA.value = false;
        }, 2000);
      }
    }
  }
}
</script>
