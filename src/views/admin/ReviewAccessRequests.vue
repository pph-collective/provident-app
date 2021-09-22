<template>
  <Loading :loading="loading" />
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
            <td data-cy="name">{{ req.name }}</td>
            <td data-cy="organization">{{ req.organization }}</td>
            <td data-cy="email">{{ req.email }}</td>
            <td>
              <span class="icon-text">
                <span
                  data-cy="approve"
                  class="icon is-small px-3 is-clickable"
                  @click="approve(req)"
                >
                  <i class="fas fa-user-check has-text-success"></i>
                </span>
                <span
                  data-cy="deny"
                  class="icon is-small px-3 is-clickable"
                  @click="deny(req)"
                >
                  <i class="fas fa-user-times has-text-danger"></i>
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import formAssignmentUtils from "@/utils/formAssignment";

import Loading from "@/components/Loading.vue";

export default {
  components: {
    Loading,
  },
  setup() {
    const loading = ref(false);

    const store = useStore();
    const organizations = computed(() => store.state.organizations);
    const userRequests = computed(() => store.getters.pendingUsers);
    const formAssignments = computed(() => store.state.formAssignments);

    const approve = async (user) => {
      loading.value = true;

      try {
        // update request status
        await fb.updateUser({ email: user.email, status: "approved" });

        await formAssignmentUtils.addFormResponsesForApproved(
          { user },
          formAssignments.value,
          organizations.value
        );

        await fb.createEmail({
          subject: `PROVIDENT Access Approved`,
          body: `<p>Hello ${user.name},</p><br><p>Your request to access PROVIDENT has been approved. <a href='${location.origin}/snack'>Go check out PROVIDENT!</a></p>`,
          to: [user.email],
        });

        store.dispatch("addNotification", {
          message: `Success! ${user.email} was approved.`,
        });
      } catch (err) {
        console.log(err);
        store.dispatch("addNotification", {
          color: "danger",
          message: err.message,
        });
      }

      loading.value = false;
    };

    const deny = async (user) => {
      await fb.db.collection("users").doc(user.id).update({ status: "denied" });

      await fb.createEmail({
        subject: "PROVIDENT Access Denied",
        body: `<p>Hello ${user.name},</p><br><p>Your request to access PROVIDENT has been denied. If you believe this is an error, please reach out to <a href='mailto:${process.env.VUE_APP_ADMIN_EMAIL}'>the PROVIDENT admin</a>.</p>`,
        to: [user.email],
      });

      store.dispatch("addNotification", {
        color: "info",
        message: `${user.email} was denied.`,
      });
    };

    return { userRequests, approve, deny, loading };
  },
};
</script>
