<template>
  <div class="container">
    <div
      v-if="alert.message"
      :class="['notification', 'mt-4', 'is-' + alert.color]"
    >
      <button class="delete" @click="dismissAlert"></button>
      {{ alert.message }}
    </div>
    <section>
      <div class="panel is-primary m-4 had-background-white">
        <p class="panel-heading">Form Assignments</p>

        <div class="panel-block is-block">
          <div class="columns">
            <span class="column has-text-centered">
              <button class="button is-primary" @click="showModal = true">
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
                  <p class="px-4"><b>Assigned To:</b></p>
                </span>
                <div
                  v-for="(target_list, category) in assignment.target"
                  :key="category"
                  class="level-item"
                >
                  <div v-if="target_list.length > 0" class="tags has-addons">
                    <span class="tag is-primary is-rounded">
                      <b>{{ category }}</b>
                    </span>
                    <span
                      v-for="(target, idx) in target_list"
                      :key="idx"
                      class="tag is-info is-rounded is-light"
                    >
                      {{ target }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal" :class="{ 'is-active': showModal }">
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Create New Form Assignment</p>
              <button
                class="delete"
                aria-label="close"
                @click="showModal = false"
              ></button>
            </header>
            <section class="modal-card-body">
              <!-- TODO: Save, Submitted, Close functions-->
              <JSONForm
                v-if="formQuestions.length > 0"
                :init-schema="formQuestions"
                :init-value="{}"
                :read-only="false"
                :showSaveButton="false"
                :close-request="0"
                @submitted="dismissAlert()"
                @close="showModal = false"
              />
            </section>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from "vue";

import fb from "@/firebase";
import JSONForm from "@/components/form/JSONForm.vue";
import { useStore } from "vuex";

export default {
  components: {
    JSONForm,
  },
  setup() {
    const store = useStore();
    const forms = ref({});
    const formAssignments = ref([]);
    const alert = reactive({ color: "", message: "" });
    const showModal = ref(false);
    const formQuestions = ref([]);

    const dismissAlert = () => {
      alert.message = "";
    };

    onMounted(async () => {
      forms.value = await fb.getForms();
      formAssignments.value = await fb.getFormAssignments();

      const formIds = Object.keys(forms.value);
      const users = await fb.getUsers();
      const emails = users.map((u) => u.email);
      const orgs = store.state.organizations.map((o) => o.name);
      const groups = ["all", "intervention", "control"];

      formQuestions.value = [
        {
          component: "Select",
          label: "Form ID",
          model: "formId",
          options: formIds,
          required: true,
        },
        {
          component: "Select",
          label: "Assign to users",
          model: "users",
          options: emails,
        },
        {
          component: "Select",
          label: "Assign to organizations",
          model: "orgs",
          options: orgs,
        },
        {
          component: "Select",
          label: "Assign to groups",
          model: "groups",
          options: groups,
        },
        {
          component: "TextInput",
          label: "Release Date",
          helpText: "The date when the form will be released to users.",
          model: "release_date",
          required: true,
        },
        {
          component: "TextInput",
          label: "Expire Date",
          helpText:
            "The due date of the form and the expire date of the form assignment. The form won't be assigned to anyone new after this date.",
          model: "expire_date",
          required: true,
        },
      ];
    });

    const createFormAssignment = async (response) => {
      console.log(response);

      const data = {
        form_id: "test",
        release_date: "2021-05-31",
        expire_date: "2021-09-09",
        target: {
          users: ["admin@admin.com"],
          organizations: ["Good Doers"],
          groups: ["Intervention"],
        },
      };

      try {
        await fb.db.collection("form_assignments").add(data);

        alert.color = "success";
        alert.message = "form assignment added";
      } catch (e) {
        console.log(e);
        alert.color = "danger";
        alert.message = e.message;
      }
    };

    return {
      alert,
      forms,
      formQuestions,
      formAssignments,
      createFormAssignment,
      dismissAlert,
      showModal,
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
