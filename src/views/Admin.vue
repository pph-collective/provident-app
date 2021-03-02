<template>
  <div
    class="container has-background-light p-5 my-5 content desktop-container"
  >
    <h1>Admin page</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Organization</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in userRequests" :key="req.email">
          <td>{{ req.name }}</td>
          <td>{{ req.organization }}</td>
          <td>{{ req.email }}</td>
          <td>
            <span class="icon-text">
              <span class="icon is-small" @click="approve(req)">
                <i class="fas fa-user-check px-2 has-text-success"></i>
              </span>
              <span class="icon is-small" @click="deny(req)">
                <i class="fas fa-user-times px-2 has-text-danger"></i>
              </span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onUnmounted } from "vue";
import fb from "@/firebase";

export default {
  setup() {
    const userRequests = ref([]);

    let unsubUserRequests = fb.db
      .collection("user_requests")
      .where("status", "==", "pending")
      .onSnapshot(snapshot => {
        userRequests.value = snapshot.docs.map(doc => {
          let userRequest = doc.data();
          return { ...userRequest, id: doc.id };
        });
      });

    // unsubscribe when leaving this page
    onUnmounted(unsubUserRequests);

    const addUser = fb.fn.httpsCallable("addUser");

    const approve = async userRequest => {
      try {
        let { uid } = await addUser({
          email: userRequest.email,
          name: userRequest.name
        });
        console.log(uid);
        // update request status
        fb.db
          .collection("user_requests")
          .doc(userRequest.id)
          .update({ status: "approved" });
        // send password reset email
        // TODO: not sending properly? how to check, also need a page to reset the email at
        fb.auth.sendPasswordResetEmail(userRequest.email);
      } catch (err) {
        console.log(err);
      }

      console.log("I approve!");
    };

    const deny = userRequest => {
      fb.db
        .collection("user_requests")
        .doc(userRequest.id)
        .update({ status: "denied" });
      console.log("Denied!");
    };

    return { userRequests, approve, deny };
  }
};
</script>
