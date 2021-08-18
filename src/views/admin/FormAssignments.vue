<template>
  <div class="container">
    <section>
      <div class="panel is-primary m-4 had-background-white">
        <p class="panel-heading">Form Assignments</p>

        <div class="panel-block is-block">
          <div class="columns">
            <span class="column has-text-centered">
              <button
                class="button is-link is-outlined"
                @click="createFormAssignment({})"
              >
                + Create
              </button>
            </span>
          </div>
        </div>

        <div class="panel-tabs">
          <a>All</a>
          <a>Active</a>
          <a>Expired</a>
        </div>

        <div
          v-if="formAssignments.length === 0"
          class="panel-block is-justify-content-center"
        >
          <span>No forms assignments here</span>
        </div>
        <div
          v-else
          v-for="(assignment, idx) in formAssignments"
          :key="'assignment-' + idx"
          class="panel-block"
        >
          <div class="form-assignment-row">
            <div class="level">
              <div class="level-left">
                <p class="level-item is-size-5">
                  <b>
                    {{ forms[assignment.form_id].title }}
                  </b>
                </p>
              </div>
              <div class="level-right has-text-centered">
                <span class="level-item tag is-success is-light"
                  ><p>
                    <strong>RELEASE DATE:</strong> {{ assignment.release_date }}
                  </p></span
                >
                <span class="level-item tag is-danger is-light"
                  ><p>
                    <strong>EXPIRE DATE:</strong> {{ assignment.expire_date }}
                  </p></span
                >
              </div>
            </div>
            <div class="level">
              <div class="level-left">
                <span class="level-item">
                  <p><b>Assigned To:</b></p>
                </span>
                <span class="level-item">
                  {{ assignment.target }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";

import fb from "@/firebase";

export default {
  setup() {
    const forms = ref({});
    // const formResponses = ref([]);
    const formAssignments = ref([]);

    onMounted(async () => {
      forms.value = await fb.getForms();
      formAssignments.value = await fb.getFormAssignments();
    });

    const createFormAssignment = async (response) => {
      console.log(response);

      const data = {
        form_id: "test",
        release_date: "2021-05-31",
        expire_date: "2021-09-09",
        target: {
          users: "admin@admin.com",
          organizations: "Good Doers",
          groups: "Intervention",
        },
      };

      const success = await fb.createFormAssignment(data);
      console.log(success);
    };

    return {
      forms,
      formAssignments,
      createFormAssignment,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";

.form-assignment-row {
  width: 100%;
}
</style>
