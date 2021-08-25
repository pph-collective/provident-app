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

        <div
          class="modal"
          :class="{ 'is-active': showModal }"
          v-esc="() => (closeFormRequest += 1)"
        >
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Create New Form Assignment</p>
              <button
                class="delete"
                aria-label="close"
                @click="closeFormRequest += 1"
              ></button>
            </header>
            <section class="modal-card-body">
              <JSONForm
                v-if="showModal"
                :init-schema="formQuestions"
                :init-value="{}"
                :read-only="false"
                :showSaveButton="false"
                :close-request="closeFormRequest"
                @submitted="createFormAssignment($event)"
                @close="showModal = false"
              />
              <p
                v-if="formMessage"
                class="has-text-centered"
                data-cy="form-message"
              >
                <small>{{ formMessage }}</small>
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import { esc } from "@/directives/escape";
import JSONForm from "@/components/form/JSONForm.vue";

export default {
  components: {
    JSONForm,
  },
  directives: {
    ...esc,
  },
  setup() {
    const alert = reactive({ color: "", message: "" });
    const closeFormRequest = ref(0);
    const formAssignments = ref([]);
    const formMessage = ref("");
    const formQuestions = ref([]);
    const forms = ref({});
    const showModal = ref(false);

    const store = useStore();
    const organizations = store.state.organizations;
    const allOrgs = organizations.map((org) => org.name);
    const interventionOrgs = organizations
      .filter((org) => org.intervention_arm)
      .map((org) => org.name);
    const controlOrgs = organizations
      .filter((org) => !org.intervention_arm)
      .map((org) => org.name);
    const users = ref([]);

    const dateRegex = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$");

    const dismissAlert = () => {
      alert.message = "";
    };

    onMounted(async () => {
      forms.value = await fb.getForms();
      formAssignments.value = await fb.getFormAssignments();
      users.value = await fb.getUsers();

      const formIds = Object.keys(forms.value);
      const emails = users.value.map((u) => u.email);
      const groups = ["all", "intervention", "control"];

      // TODO: Use multi-select and datepicker components
      // TODO: Show the form type to the user
      // TODO: & update the single/multi select to allow different values than what is displayed to the user
      formQuestions.value = [
        {
          component: "Select",
          label: "Form ID",
          model: "form_id",
          options: formIds,
          required: true,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to users",
          model: "users",
          options: emails,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to organizations",
          model: "organizations",
          options: allOrgs,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to groups",
          model: "groups",
          options: groups,
        },
        {
          component: "TextInput",
          label: "Release Date (yyyy-mm-dd)",
          helpText: "The date when the form will be released to users.",
          model: "release_date",
          required: true,
          validations: `yup.string().matches(${dateRegex}, 'Must be in yyyy-mm-dd format')`,
        },
        {
          component: "TextInput",
          label: "Expire Date (yyyy-mm-dd)",
          helpText:
            "The due date of the form and the expire date of the form assignment. The form won't be assigned to anyone new after this date.",
          model: "expire_date",
          required: true,
          validations: `yup.string().matches(${dateRegex}, 'Must be in yyyy-mm-dd format')`,
        },
      ];
    });

    const createFormAssignment = async (response) => {
      const formAssignmentData = {
        created_date: new Date(),
        form_id: response.form_id,
        release_date: response.release_date,
        expire_date: response.expire_date,
        target: {
          users: response.users ?? [],
          organizations: response.organizations ?? [],
          groups: response.groups ?? [],
        },
      };

      try {
        // Create the form assignment on the db
        const formAssignment = await fb.db
          .collection("form_assignments")
          .add(formAssignmentData);
        formAssignmentData._id = formAssignment.id;

        // Create the form responses
        await createFormResponses(formAssignmentData);

        // Update the page
        formAssignments.value.push(formAssignmentData);

        showModal.value = false;
        alert.color = "success";
        alert.message = "form assignment added";

        // show the message only for 6 seconds
        setTimeout(() => (alert.message = ""), 6000);
      } catch (e) {
        console.log(e);
        formMessage.value = "Error adding form assignment";

        // show the message only for 6 seconds
        setTimeout(() => (formMessage.value = ""), 6000);
      }
    };

    const createFormResponses = async (formAssignment) => {
      const form_id = formAssignment.form_id;
      const form = forms.value[form_id];
      const form_type = form.type;

      const formResponseData = {
        form_id,
        title: form.title,
        type: form_type,
        form_assignment_id: formAssignment._id,
        release_date: formAssignment.release_date,
        expire_date: formAssignment.expire_date,
        response: {},
        status: "Not Started",
        last_updated: new Date(),
      };

      const assignedGroups = [...formAssignment.target.groups];
      const assignedOrgs = new Set([
        ...formAssignment.target.organizations,
        ...(assignedGroups.includes("all") ? allOrgs : []),
        ...(assignedGroups.includes("intervention") ? interventionOrgs : []),
        ...(assignedGroups.includes("control") ? controlOrgs : []),
      ]);

      try {
        if (form_type === "organization") {
          for (const org of assignedOrgs) {
            await fb.updateFormResponse(undefined, org, formResponseData);
          }
        } else if (form_type === "user") {
          const assignedUsers = new Set([
            ...formAssignment.target.users,
            ...users.value
              .filter((u) => assignedOrgs.has(u.organization))
              .map((u) => u.email),
          ]);

          for (const email of assignedUsers) {
            await fb.updateFormResponse(email, undefined, formResponseData);
          }
        }
      } catch (e) {
        alert.color = "danger";
        alert.message = "Error creating forms";
      }
    };

    return {
      alert,
      closeFormRequest,
      createFormAssignment,
      createFormResponses,
      dismissAlert,
      formAssignments,
      formMessage,
      formQuestions,
      forms,
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
