<template>
  <LoadingSpinner :loading="loading" />
  <div class="container">
    <section class="section">
      <h1 class="title">Review Access Requests</h1>

      <table class="table" data-cy="user-request-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Organization</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="req in userRequests"
            :key="req.email"
            data-cy="user-request"
          >
            <td data-cy="name">
              {{ req.name }}
            </td>
            <td data-cy="organization">
              {{ req.organization }}
            </td>
            <td data-cy="email">
              {{ req.email }}
            </td>
            <td>
              <span class="icon-text">
                <span
                  data-cy="approve"
                  class="icon is-small px-3 is-clickable"
                  @click="approve(req)"
                >
                  <i class="fas fa-user-check has-text-success" />
                </span>
                <span
                  data-cy="deny"
                  class="icon is-small px-3 is-clickable"
                  @click="deny(req)"
                >
                  <i class="fas fa-user-times has-text-danger" />
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useProvidentStore } from "../../store";

import { db, updateUser, createEmail } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import formAssignmentUtils from "../../utils/formAssignment";

import LoadingSpinner from "../../components/LoadingSpinner.vue";

const loading = ref(false);

const store = useProvidentStore();
const organizations = computed(() => store.organizations);
const userRequests = computed(() => store.pendingUsers);
const formAssignments = computed(() => store.formAssignments);

const approve = async (user) => {
  loading.value = true;

  try {
    // update request status
    await updateUser({ email: user.email, status: "approved" });

    await formAssignmentUtils.addFormResponsesForApproved(
      "user",
      user,
      formAssignments.value,
      organizations.value,
    );

    const body = `<p>Hello ${user.name},</p><br><p>Your request to access PROVIDENT has been approved. <a href='${location.origin}/snack'>Go check out PROVIDENT!</a></p>`;

    await createEmail({
      subject: `PROVIDENT Access Approved`,
      body,
      to: [user.email],
    });

    store.addNotification({
      message: `Success! ${user.email} was approved.`,
    });
  } catch (err) {
    console.log(err);
    store.addNotification({
      color: "danger",
      message: err.message,
    });
  }

  loading.value = false;
};

const deny = async (user) => {
  await updateDoc(doc(db, "users", user.id), { status: "denied" });

  const body = `<p>Hello ${
    user.name
  },</p><br><p>Your request to access PROVIDENT has been denied. If you believe this is an error, please reach out to <a href='mailto:${
    import.meta.env.VITE_APP_ADMIN_EMAIL
  }'>the PROVIDENT admin</a>.</p>`;

  await createEmail({
    subject: "PROVIDENT Access Denied",
    body,
    to: [user.email],
  });

  store.addNotification({
    color: "info",
    message: `${user.email} was denied.`,
  });
};
</script>
