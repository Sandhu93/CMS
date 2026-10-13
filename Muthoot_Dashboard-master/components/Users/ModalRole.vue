<template>
  <div
    class="absolute top-0 left-0 w-screen min-h-screen flex justify-center items-center bg-black/60"
  >
    <div
      class="w-[450px] p-5 text-white font-quicksand flex flex-col gap-3 bg-new-blue bg-opacity-[0.15] backdrop-blur-lg rounded-lg relative"
    >
      <div class="flex justify-between w-full">
        <span
          @click="dropDownToggle"
          class="text-white text-2xl font-semibold"
          >{{ editMode ? "Update Role" : "Add Role" }}</span
        >
        <SVGCloseCross
          @click="dropDownToggle"
          class="text-white text-2xl cursor-pointer"
        />
      </div>
      <section class="w-full flex gap-2 cursor-default">
        <div class="w-full flex flex-col gap-1">
          <h3 class="text-sm">Name</h3>
          <input
            :value="details.name"
            @change="details.name = $event.target.value"
            type="text"
            placeholder="Data Specialist"
            class="border bg-transparent border-white/30 rounded-md w-full h-10 p-3 outline-none"
          />
        </div>
      </section>
      <section class="w-full flex flex-col gap-1 cursor-default">
        <h3 class="text-sm">Description</h3>
        <textarea
          :value="details.desc"
          @change="details.desc = $event.target.value"
          placeholder="Has access to status and its detailed view"
          rows="2"
          class="border bg-transparent border-white/30 rounded-md w-full p-3 outline-none"
        />
      </section>
      <section class="w-full flex flex-col gap-1 cursor-default">
        <h3 class="text-sm">Permissions</h3>
        <UsersPermissionPicker
          :permissions="permissions"
          :permission="details.permissions"
        />
      </section>
      <div
        @click="handleSubmit"
        :class="` w-full h-12 bg-new-blue/80 hover:bg-new-blue text-black font-semibold rounded-md justify-center flex items-center mt-5 cursor-pointer transition-all ease-in-out duration-500`"
      >
        <SVGLoading v-if="loading" />
        <span v-else>{{
          editMode ? "Update" : "Create"
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationsStore } from "@/store/notifications";
const config = useRuntimeConfig();
const loading = ref(false);
const notifications = useNotificationsStore();
const { add } = notifications;
const { roles, permissions, editMode, selectedRole } = defineProps([
  "roles",
  "permissions",
  "editMode",
  "selectedRole",
]);
const details = ref({
  name: selectedRole?.name ?? "",
  value: selectedRole?.value ?? "user",
  desc: selectedRole?.desc ?? "",
  permissions: selectedRole?.permissions ?? [],
});
const list = ref(roles);
const emit = defineEmits(["dropDownToggle"]);
const dropDownToggle = (role) => {
  emit("dropDownToggle", role);
};

const handleSubmit = async () => {
  loading.value = true;
  if (details.value.name == "" || details.value.desc == "") {
    console.log(details.value);
    add({
      title: "Error",
      text: "Please fill in all the details.",
      color: "red",
    });
    loading.value = false;
    return;
  }
  const { data, error } = await useFetch(`${config.public.api}/api/roles`, {
    method: editMode ? "PATCH" : "POST",
    body: JSON.stringify({
      name: details.value.name,
      value: details.value.value,
      desc: details.value.desc,
      permissions: details.value.permissions.map((x) => x.split(" ").join("")),
    }),
    headers: {
      "Content-Type": "application/json",
      authorization: `${localStorage.getItem("token")}`,
    },
  });
  if (data && data.value && data.value.statusCode === 200) {
      add({
        title: "Success",
        text: `${editMode ? "Updated" : "Created"} Role Successfully`,
        color: "green",
      });
      loading.value = false;
      dropDownToggle(data.value.data);
  } else {
      add({
        title: `Error ${error.value.statusCode}`,
        text: error.value.statusMessage,
        color: "red",
      });
      loading.value = false;
  }
  // console.log(data.value);
  // console.log(error.value);
};

function updateDetails(role) {
  details.value.name = role.name;
  details.value.value = role.value;
  details.value.desc = role.desc;
  details.value.permissions = role.permissions;
}

defineExpose({
  updateDetails,
});
</script>
