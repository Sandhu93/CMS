<template>
  <div
    class="absolute top-0 left-0 w-screen min-h-screen flex justify-center items-center bg-new-black/60"
  >
    <div
      class="w-[450px] p-5 text-white font-quicksand flex flex-col gap-3 bg-new-blue bg-opacity-[0.15] backdrop-blur-lg rounded-lg relative"
    >
      <div class="flex justify-between w-full">
        <span @click="dropDownToggle" class="text-white text-2xl"
          >{{ editMode ? "Edit" : "Add" }} User</span
        >
        <SVGCloseCross
          @click="editMode ? dropDownEditToggle() : dropDownToggle()"
          class="text-white text-2xl cursor-pointer"
        />
      </div>
      <section class="w-full flex gap-2 cursor-default">
        <div class="w-1/2 flex flex-col gap-1">
          <h3 class="text-sm">Name</h3>
          <input
            :value="details.name"
            style="outline: none"
            @change="details.name = $event.target.value"
            type="text"
            placeholder="John Doe"
            class="border bg-transparent border-white/30 rounded-md w-full h-10 p-3"
          />
        </div>
        <div class="w-1/2 flex flex-col gap-1">
          <h3 class="text-sm">Role</h3>
          <UsersDropdownPicker
            :list="list"
            :selected="details.role"
            @update="(selectedRole) => (details.role = selectedRole.value)"
          />
        </div>
      </section>
      <section
        v-if="!editMode"
        class="w-full flex flex-col gap-1 cursor-default"
      >
        <h3 class="text-sm">Email</h3>
        <input
          style="outline: none"
          @change="details.email = $event.target.value"
          type="text"
          placeholder="johndoe@example.com"
          class="border bg-transparent border-white/30 rounded-md w-full h-10 p-3"
        />
      </section>
      <section
        v-if="!editMode"
        class="w-full flex flex-col gap-1 cursor-default"
      >
        <h3 class="text-sm">Password</h3>
        <input
          style="outline: none"
          @change="details.password = $event.target.value"
          type="password"
          class="border bg-transparent border-white/30 rounded-md w-full h-10 p-3"
        />
      </section>
      <section
        v-if="!editMode"
        class="w-full flex flex-col gap-1 cursor-default"
      >
        <h3 class="text-sm">Retype Password</h3>
        <input
          style="outline: none"
          @change="details.retypePassword = $event.target.value"
          type="password"
          class="border bg-transparent border-white/30 rounded-md w-full h-10 p-3"
        />
      </section>
      <div
        @click="handleSubmit"
        :class="` w-full h-12 bg-new-blue/80 hover:bg-new-blue text-black font-semibold rounded-md justify-center flex items-center mt-5 cursor-pointer transition-all ease-in-out duration-500`"
      >
        <SVGLoading v-if="loading" />
        <span v-else>{{ editMode ? "Update" : "Create" }}</span>
      </div>
    </div>
    <CommonPopup ref="popup" />
  </div>
</template>

<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
const { user, roles, editMode } = defineProps(["user", "roles", "editMode"]);
const popup = ref(null);
const notifications = useNotificationsStore();
const { add } = notifications;
const emailRegex = new RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
const passUpperRegex = new RegExp(".*[A-Z].*");
const passLowerRegex = new RegExp(".*[a-z].*");
const passSpecialRegex = new RegExp("/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g");
const passDigitRegex = new RegExp(".*[0-9].*");
const passEightRegex = new RegExp(".{8,}");
const details = ref({
  name: user?.name ?? "",
  role: user?.role ?? "user",
  email: user?.email ?? "",
  password: "",
  retypePassword: "",
});
const loading = ref(false);
const list = ref(roles);
const emit = defineEmits(["dropDownToggle", "dropDownEditToggle"]);
const dropDownToggle = (user) => {
  emit("dropDownToggle", user);
};
const dropDownEditToggle = (user) => {
  emit("dropDownEditToggle", user);
};

// function editUserDetails(editedUser) {
//   details.value.name = editedUser.name;
//   details.value.role = editedUser.role;
// }

const handleSubmit = async () => {
  if (
    details.value.name == "" ||
    (details.value.role == "" && !editMode) ||
    (!editMode && details.value.password == "") ||
    (!editMode && details.value.retypePassword == "")
  ) {
    popup.value.update("Please fill in all the details.", "red");
    return;
  }
  if (!editMode) {
    if (details.value.password != details.value.retypePassword) {
      popup.value.update("Password doesn't match!", "red");
      return;
    }
    if (!passUpperRegex.test(details.value.password)) {
      popup.value.update(
        "Please include an uppercase letter in your password.",
        "red"
      );
      return;
    }
    if (!passLowerRegex.test(details.value.password)) {
      popup.value.update(
        "Please include a lowercase letter in your password.",
        "red"
      );
      return;
    }
    // if (!passSpecialRegex.test(details.value.password)) {
    //   popup.value.update(
    //     "Please include a special character in your password.",
    //     "red"
    //   );
    //   return;
    // }
    if (!passDigitRegex.test(details.value.password)) {
      popup.value.update("Please include a digit in your password.", "red");
      return;
    }
    if (!passEightRegex.test(details.value.password)) {
      popup.value.update(
        "Please include atleast 8 characters in your password.",
        "red"
      );
      return;
    }
    if (!emailRegex.test(details.value.email)) {
      // console.log(details.value.email);
      // console.log(emailRegex.test(details.value.email));
      popup.value.update("Please enter a real email.", "red");
      return;
    }
  }
  loading.value = true;
  const { data, error } = await useFetch(
    `${config.public.api}/api/${editMode ? "users" : "register"}`,
    {
      method: editMode ? "PATCH" : "POST",
      body: JSON.stringify(details.value),
      headers: {
        "Content-Type": "application/json",
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (data && data.value && data.value.statusCode === 200) {
    add({
      title: "Success",
      text: `${editMode ? "Updated" : "Created"} User Successfully`,
      color: "green",
    });
    loading.value = false;
    if (editMode) dropDownEditToggle(data.value.data);
    else dropDownToggle(data.value.data);
  } else {
    add({
      title: `Error ${error.value.statusCode}`,
      text: error.value.statusMessage,
      color: "red",
    });
    loading.value = false;
  }
};
// defineExpose({ editUserDetails });
</script>
