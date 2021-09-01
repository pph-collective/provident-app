<template>
  <div class="container">
    <section class="section">
      <h1 class="title">User Management</h1>

      <table class="table" data-cy="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Organization</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.email" data-cy="user-request">
            <td data-cy="name">{{ user.name }}</td>
            <td data-cy="organization">{{ user.organization }}</td>
            <td data-cy="email">{{ user.email }}</td>
            <td v-if="user.edit">
              <select v-model="user.role">
                <option>user</option>
                <option>champion</option>
              </select>
            </td>
            <td v-else>{{ user.role }}</td>
            <td v-if="user.edit">
              <span
                data-cy="save"
                class="icon is-small px-3 is-clickable"
                @click="
                  user.edit = false;
                  saveUser(user);
                "
              >
                <i class="far fa-save" alt="save"></i>
              </span>
            </td>
            <td v-else @click="user.edit = true">
              <i class="fas fa-pencil-alt is-clickable" alt="edit" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    {{ users }}
  </div>
</template>

<script>
import { ref, onUnmounted } from "vue";

import fb from "@/firebase.js";

export default {
  setup() {
    const users = ref([]);

    let unsubUsers = fb.db
      .collection("users")
      .where("status", "==", "approved")
      .onSnapshot((snapshot) => {
        users.value = snapshot.docs.map((doc) => {
          let user = doc.data();
          return { ...user, id: doc.id, edit: false };
        });
      });

    // unsubscribe when leaving this page
    onUnmounted(unsubUsers);

    const saveUser = async ({ email, role }) => {
      try {
        await fb.updateUser({ email, role });
      } catch (err) {
        console.log(err);
      }
    };

    return {
      users,
      saveUser,
    };
  },
};
</script>
