<template>
  <Loading :loading="users.length === 0" />
  <div class="user-management container">
    <section class="section">
      <h1 class="title">User Management</h1>

      <table class="table" data-cy="user-table">
        <thead>
          <tr>
            <th
              v-for="field in fields"
              :key="field"
              class="is-clickable"
              @click="updateSort(field)"
            >
              <span class="icon-text">
                <span>{{ field }}</span>
                <span
                  :class="{ 'is-invisible': field.toLowerCase() !== sortField }"
                  class="icon mx-0 has-text-grey"
                >
                  <i
                    class="fas"
                    :class="['fa-arrow-' + (sortAscending ? 'up' : 'down')]"
                  />
                </span>
              </span>
            </th>
            <th />
          </tr>
          <tr>
            <th>
              <input
                v-model="filters.name"
                type="text"
                class="input is-small"
              />
            </th>
            <th>
              <div class="select is-small">
                <select v-model="filters.organization">
                  <option />
                  <option v-for="org in organizations" :key="org.name">
                    {{ org.name }}
                  </option>
                </select>
              </div>
            </th>
            <th>
              <input
                v-model="filters.email"
                type="text"
                class="input is-small"
              />
            </th>
            <th>
              <div class="select is-small">
                <select v-model="filters.role">
                  <option />
                  <option v-for="role in roles" :key="role">
                    {{ role }}
                  </option>
                </select>
              </div>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.email"
            data-cy="user-request"
          >
            <td data-cy="name">
              {{ user.name }}
            </td>
            <td data-cy="organization">
              {{ user.organization }}
            </td>
            <td data-cy="email">
              {{ user.email }}
            </td>
            <td v-if="user.edit" data-cy="role">
              <div class="select is-small">
                <select v-model="user.role">
                  <option v-for="role in roles" :key="role">
                    {{ role }}
                  </option>
                </select>
              </div>
            </td>
            <td v-else data-cy="role">
              {{ user.role }}
            </td>
            <td v-if="user.edit">
              <span
                data-cy="save"
                class="icon is-small px-3 is-clickable"
                @click="
                  user.edit = false;
                  saveUser(user);
                "
              >
                <i class="far fa-save" alt="save" />
              </span>
            </td>
            <td v-else @click="user.edit = true">
              <i class="fas fa-pencil-alt is-clickable" alt="edit" />
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5">
              <div class="is-flex is-justify-content-center">
                <p>No users found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";

import Loading from "@/components/Loading.vue";

import fb from "@/firebase.js";
import utils from "@/utils/utils.js";

export default {
  components: {
    Loading,
  },
  setup() {
    const store = useStore();
    const organizations = computed(() => store.state.organizations);
    const users = computed(() =>
      store.getters.approvedUsers.map((user) => {
        user.edit = false;
        return user;
      })
    );
    const roles = ["champion", "user"];
    const fields = ["Name", "Organization", "Email", "Role"];
    const sortField = ref("name");
    const sortAscending = ref(true); // ascending

    const filters = reactive({
      name: "",
      organization: "",
      email: "",
      role: "",
    });

    const filteredUsers = computed(() => {
      let filtered = users.value;
      for (const [filter, value] of Object.entries(filters)) {
        if (value) {
          filtered = filtered.filter((user) =>
            user[filter].toLowerCase().includes(value.toLowerCase())
          );
        }
      }
      filtered.sort(utils.sortByProperty(sortField.value));

      if (!sortAscending.value) filtered.reverse();

      return filtered;
    });

    const saveUser = async ({ email, role }) => {
      try {
        await fb.updateUser({ email, role });
      } catch (err) {
        console.log(err);
      }
    };

    const updateSort = (fieldTitle) => {
      const field = fieldTitle.toLowerCase();
      if (field === sortField.value) {
        sortAscending.value = !sortAscending.value; // flip sort order
      } else {
        sortField.value = field;
        sortAscending.value = true;
      }
    };

    return {
      organizations,
      roles,
      fields,
      users,
      filteredUsers,
      filters,
      saveUser,
      sortField,
      sortAscending,
      updateSort,
    };
  },
};
</script>
