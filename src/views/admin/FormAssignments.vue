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
              <!-- TODO: Save, Submitted, Close functions-->
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

      // TODO: Use multi-select and datepicker components
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
      const formAssignmentData = {
        form_id: response.form_id,
        release_date: response.release_date,
        expire_date: response.expire_date,
        target: {
          users: response.users ? [response.users] : [],
          organizations: response.organizations ? [response.organizations] : [],
          groups: response.groups ? [response.groups] : [],
        },
      };

      try {
        await fb.db.collection("form_assignments").add(formAssignmentData);
        showModal.value = false;
        alert.color = "success";
        alert.message = "form assignment added";
      } catch (e) {
        console.log(e);
        formMessage.value = "Error adding form assignment";
      }
    };

    const createFormResponses = (formAssignment) => {
      console.log(formAssignment);
      // const formResponseData = {
      //   form_id: response.form_id,
      //   type: forms[form_id].type,
      //   release_date: response.release_date,
      //   due_date: response.expire_date,
      //   response: []
      //   status: "Not Started"
      // }
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
