<template>
  <div class="h-full w-full max-w-screen-2xl mx-auto">
    <div v-if="loading" class="flex flex-col h-full w-full animate-pulse">
      <!-- Title Button -->
      <div class="flex h-14 w-full px-8 pt-4 justify-between">
        <!-- Alarm -->
        <div class="w-1/4 mx-2 bg-new-blue/10 rounded-lg px-4 py-3"></div>
        <!-- Connectivity -->
        <div class="w-24 mx-2 bg-new-blue/10 rounded-lg"></div>
      </div>
      <!-- Users -->
      <div
        class="flex h-14 bg-new-blue/10 m-4 rounded-lg items-center pl-4 pr-8 justify-between"
      ></div>
    </div>
    <div v-else class="flex h-full w-full">
      <div class="w-1/2" v-if="userPermissions.includes('ViewUsers,')">
        <div class="flex w-full justify-between pl-8 pr-4 pt-8 text-white">
          <h1 class="text-2xl font-semibold">Users</h1>
          <div class="flex gap-4">
            <div class="h-10 bg-white/10 rounded flex items-center">
              <SVGSearch class="text-white/60 ml-2" :size="'28'" />
              <input
                class="flex-1 h-full bg-transparent outline-none rounded-lg p-4 pl-3 text-white text-sm"
                placeholder="Search a User"
                @input="search"
                v-model="userSearch"
              />
            </div>
            <div
              v-if="userPermissions.includes('EditUser,')"
              @click="dropDownToggleUser"
              class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
            >
              <SVGPlus class="text-white" />
              <span class="font-medium">Add Users</span>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col px-4 py-8 rounded-lg m-4 ml-8 bg-new-blue/10 gap-4"
        >
          <div
            v-for="(user, i) in data"
            :key="user.email"
            class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
          >
            <UsersUserCard
              @toggleDropEdit="dropDownToggleUserEdit(null, user)"
              @toggleDropDelete="dropDownToggleUserDelete(null, user)"
              :user="user"
              :index="i"
              :roles="roles"
              :allowEdit="userPermissions.includes('EditUser,')"
            />
          </div>
        </div>
      </div>

      <div class="w-1/2" v-if="userPermissions.includes('ViewRoles,')">
        <div class="flex w-full justify-between pr-8 pl-4 pt-8 text-white">
          <h1 class="text-2xl font-semibold">Roles</h1>
          <div
            v-if="userPermissions.includes('EditRole,')"
            @click="dropDownToggleRole"
            class="bg-white/10 pr-6 pl-4 py-2 rounded hover:bg-white/20 cursor-pointer flex gap-2"
          >
            <SVGPlus class="text-white" />
            <span class="font-medium">Add Roles</span>
          </div>
        </div>
        <div
          class="flex flex-col px-4 py-8 rounded-lg m-4 mr-8 bg-new-blue/10 gap-4"
        >
          <div
            v-for="(role, i) in roles"
            :key="i"
            class="bg-white/10 py-4 px-4 rounded gap-4 flex items-center"
          >
            <UsersRoleCard
              @dropDownEdit="() => dropDownToggleRoleEdit(null, role)"
              @dropDownDelete="() => dropDownToggleRoleDelete(null, role)"
              :role="role"
              :index="i"
              :allowEdit="userPermissions.includes('EditRole,')"
            />
          </div>
        </div>
      </div>
    </div>
    <UsersModalUser
      v-if="dropDownUser"
      :roles="roles"
      @dropDownToggle="dropDownToggleUser"
    />
    <UsersModalUser
      v-if="dropDownUserEdit"
      :editMode="true"
      :roles="roles"
      :user="selectedUser"
      @dropDownEditToggle="dropDownToggleUserEdit"
    />
    <UsersModalRole
      v-if="dropDownRole"
      :roles="roles"
      @dropDownToggle="dropDownToggleRole"
      :permissions="permissions"
    />
    <UsersModalRole
      v-if="dropDownRoleEdit"
      :roles="roles"
      :editMode="true"
      :selectedRole="selectedRole"
      @dropDownToggle="dropDownToggleRoleEdit"
      :permissions="permissions"
    />
    <UsersDeleteModalRole
      v-if="dropDownRoleDelete"
      :selectedRole="selectedRole"
      @dropDownToggle="dropDownToggleRoleDelete"
    />
    <UsersDeleteModalUser
      v-if="dropDownUserDelete"
      :selectedUser="selectedUser"
      @dropDownToggle="dropDownToggleUserDelete"
    />
  </div>
</template>
<script setup>
const config = useRuntimeConfig();
definePageMeta({
  layout: "dashboard",
});
useHead({
  title: `Users`,
});

const { $io } = useNuxtApp();
const router = useRouter();

const loading = ref(true);
const data = ref([]);
const tempData = ref([]);
const roles = ref([]);
const permissions = ref([]);
const userPermissions = ref(localStorage.getItem("permissions"));

const userSearch = ref(null);
const selectedUser = ref(null);
const dropDownUser = ref(false);
const dropDownUserEdit = ref(false);
const dropDownUserDelete = ref(false);


const dropDownRole = ref(false);
const selectedRole = ref(null);
const dropDownRoleEdit = ref(false);
const dropDownRoleDelete = ref(false);


function search() {
    if (userSearch.value === "") {
        data.value = tempData.value;
        return;
    }
    data.value = tempData.value.filter(
      (d) =>
        d.email.toLowerCase().includes(userSearch.value.toLowerCase()) ||
        d.name.toLowerCase().includes(userSearch.value.toLowerCase())
    );
}
const dropDownToggleUser = (user) => {
    dropDownUser.value = !dropDownUser.value;
    if(user?.email) {
        data.value.push(user);
    }
};

const dropDownToggleUserEdit = (user, selectedUserToEdit) => {
    selectedUser.value = selectedUserToEdit;
    dropDownUserEdit.value = !dropDownUserEdit.value;
    if(user?.email) {
        // find user by user.email from data.value and replace it
        const index = data.value.findIndex((u) => u.email === user.email);
        data.value[index] = user;
    }
};

const dropDownToggleUserDelete = (user, userDeleted) => {
    selectedUser.value = userDeleted;
    dropDownUserDelete.value = !dropDownUserDelete.value;
    if(user?.email) {
        // find user by user.email from data.value and replace it
        data.value = data.value.filter((u) => u.email !== user.email);
    }
};

const dropDownToggleRole = (role) => {
    dropDownRole.value = !dropDownRole.value;
    if(role?.value) {
        roles.value.push(role);
    }
};

const dropDownToggleRoleEdit = (role, selectedRoleToEdit) => {
  selectedRole.value = selectedRoleToEdit;
  // role ? editModal.value.updateDetails(role) : "";
  dropDownRoleEdit.value = !dropDownRoleEdit.value;
  if(role?.value) {
    // find role by role.name from roles.value and replace it
    const index = roles.value.findIndex((r) => r.value === role.value);
    roles.value[index] = role;
  }
};

const dropDownToggleRoleDelete = (role, roleDeleted) => {
  selectedRole.value = roleDeleted;
  // role ? deleteModal.value.selectRoleDelete(role.value) : "";
  dropDownRoleDelete.value = !dropDownRoleDelete.value;
  if(role?.value) {
    // find role by role.name from roles.value and replace it
    roles.value = roles.value.filter((r) => r.value !== role.value);
  }
};

async function loadData() {
  const { data: users, error } = await useFetch(
    `${config.public.api}/api/users`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error.value) {
    if (error.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  if (users.value.statusCode === 200) {
    tempData.value = users.value.data;
    data.value = users.value.data;
  }
  const { data: roles2, error: error2 } = await useFetch(
    `${config.public.api}/api/roles`,
    {
      headers: {
        authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  if (error2.value) {
    if (error2.value.statusCode === 401) {
      setTimeout(() => {
        // auth.clear();
        router.push("/");
      }, 5000);
    }
    console.log(error2.value);
    // if(popup.value) popup.value.update(`${error.value.statusCode} ${error.value.statusMessage}`, "red");
    return;
  }
  if (roles2.value.statusCode === 200) {
    roles.value = roles2.value.data.roles;
    permissions.value = roles2.value.data.permissions;
  }
  loading.value = false;
  return data;
}
loadData();
</script>
