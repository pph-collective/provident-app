<template>
  <div class="container">
    <div
      v-if="alert.message"
      data-cy="alert-message"
      :class="['notification', 'mt-4', 'is-' + alert.color]"
    >
      <button class="delete" @click="dismissAlert"></button>
      {{ alert.message }}
    </div>
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
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";

import fb from "@/firebase";
import { useStore } from "vuex";

import formAssignmentUtils from "@/utils/formAssignmentUtils";

export default {
  setup() {
    const userRequests = ref([]);
    const alert = reactive({ color: "", message: "" });
    const formAssignments = ref([]);

    const store = useStore();
    const organizations = computed(() => store.state.organizations);

    const dismissAlert = () => {
      alert.message = "";
    };

    let unsubUserRequests = fb.db
      .collection("users")
      .where("status", "==", "pending")
      .onSnapshot((snapshot) => {
        userRequests.value = snapshot.docs.map((doc) => {
          let userRequest = doc.data();
          return { ...userRequest, id: doc.id };
        });
      });

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    onMounted(async () => {
      formAssignments.value = await fb.getCollection("form_assignments");
      formAssignments.value = formAssignments.value.filter(
        (f) => f.form_type === "user" && today <= f.expire_date
      );
    });

    // unsubscribe when leaving this page
    onUnmounted(unsubUserRequests);

    const approve = async (user) => {
      try {
        // update request status
        // TODO: emails on approval/denial
        await fb.db
          .collection("users")
          .doc(user.id)
          .update({ status: "approved" });

        await createFormResponses(formAssignments.value, user);

        alert.color = "success";
        alert.message = `Success! ${user.email} was approved.`;
      } catch (err) {
        console.log(err);
        alert.color = "danger";
        alert.message = err.message;
      }
    };

    const deny = (userRequest) => {
      fb.db
        .collection("users")
        .doc(userRequest.id)
        .update({ status: "denied" });

      alert.color = "info";
      alert.message = `${userRequest.email} was denied.`;
    };

    const createFormResponses = async (formAssignments, user) => {
      for (const formAssignment of formAssignments) {
        const assignedOrganizations = await formAssignmentUtils.getAssignedOrgs(
          formAssignment.target,
          organizations.value
        );

        if (assignedOrganizations.has(user.organization)) {
          const blankFormResponse =
            formAssignmentUtils.getFormResponseData(formAssignment);
          await fb.createFormResponses(blankFormResponse, [user.email]);
        }
      }
    };

    return { userRequests, approve, deny, alert, dismissAlert };
  },
};
</script>
