<template>
  <div class="container">
    <div
      v-if="alert.message"
      :class="['notification', 'mt-4', 'is-' + alert.color]"
      data-cy="alert-message"
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
              <button
                class="button is-primary"
                data-cy="create-button"
                @click="showModal = true"
              >
                + Create
              </button>
            </span>
          </div>
        </div>

        <div class="panel-tabs">
          <a
            v-for="tab in tabs"
            :key="tab"
            :class="selectedTab === tab ? 'is-active' : ''"
            @click="selectedTab = tab"
            >{{ tab }}</a
          >
        </div>

        <div
          v-if="selectedFormAssignments.length === 0"
          class="panel-block is-justify-content-center"
          data-cy="form-assignment-panel-block"
        >
          <span>No forms assignments here</span>
        </div>
        <div
          v-else
          v-for="(assignment, idx) in selectedFormAssignments"
          :key="'assignment-' + idx"
          class="panel-block"
          data-cy="form-assignment-panel-block"
        >
          <div class="form-assignment-row" data-cy="form-assignment-row">
            <div class="level">
              <div class="level-left">
                <p class="level-item is-size-5">
                  <b v-if="assignment.form_id in forms">
                    {{ forms[assignment.form_id].title }}
                  </b>
                </p>
              </div>
              <div class="level-right has-text-centered">
                <span
                  class="level-item tag is-success is-light"
                  data-cy="release-date-tag"
                  ><p>
                    <strong>RELEASE DATE:</strong> {{ assignment.release_date }}
                  </p></span
                >
                <span
                  class="level-item tag is-danger is-light"
                  data-cy="expire-date-tag"
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
                  <div
                    v-if="target_list.length > 0"
                    class="tags has-addons"
                    data-cy="target-tags"
                  >
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
          v-if="showModal && formQuestions.length > 0"
          class="modal"
          :class="{ 'is-active': showModal }"
          data-cy="form-assignment-modal"
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
import { computed, onMounted, reactive, ref } from "vue";
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
    const showModal = ref(false);

    const store = useStore();
    const forms = computed(() => store.state.forms);
    const organizations = computed(() => store.state.organizations);
    const allOrgs = computed(() => organizations.value.map((org) => org.name));
    const users = ref([]);

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    const tabs = ref(["Active (Not Expired)", "Released", "Expired", "All"]);
    const selectedTab = ref("Active (Not Expired)");
    const selectedFormAssignments = computed(() => {
      if (selectedTab.value === "All") return formAssignments.value;

      return formAssignments.value.filter((formAssignment) => {
        if (
          selectedTab.value === "Active (Not Expired)" &&
          today < formAssignment.expire_date
        ) {
          return true;
        } else if (
          selectedTab.value === "Released" &&
          formAssignment.release_date <= today &&
          today < formAssignment.expire_date
        ) {
          return true;
        } else if (
          selectedTab.value === "Expired" &&
          today >= formAssignment.expire_date
        ) {
          return true;
        }

        return false;
      });
    });

    const dismissAlert = () => {
      alert.message = "";
    };

    const formQuestions = computed(() => {
      if (
        Object.keys(forms.value).length === 0 ||
        users.value.length === 0 ||
        allOrgs.value.length === 0
      ) {
        return [];
      }

      const formOptions = Object.values(forms.value).map((f) => {
        return { value: f._id, label: `${f.title} (type: ${f.type})` };
      });
      formOptions.sort((a, b) => (a.label > b.label ? 1 : -1));

      const userTypeForms = Object.values(forms.value)
        .filter((f) => f.type === "user")
        .map((f) => f._id);

      const userOptions = users.value.map((u) => {
        return { value: u.email, label: `${u.name} (${u.email})` };
      });
      userOptions.sort((a, b) => (a.label > b.label ? 1 : -1));

      const groups = ["all", "intervention", "control"];

      return [
        {
          component: "Select",
          label: "Form",
          model: "form_id",
          options: formOptions,
          required: true,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to groups",
          model: "groups",
          options: groups,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to organizations",
          model: "organizations",
          options: allOrgs.value,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to users",
          helpText: "Only user forms can be directly assigned to users.",
          model: "users",
          default: [],
          options: userOptions,
          condition: `(model) => model.form_id && ${JSON.stringify(
            userTypeForms
          )}.includes(model.form_id)`,
        },
        {
          component: "Date",
          label: "Release Date",
          helpText: "The date when the form will be released to users.",
          model: "release_date",
          required: true,
          minDate: "today",
        },
        {
          component: "Date",
          label: "Expire Date",
          helpText:
            "The due date of the form and the expire date of the form assignment. The form won't be assigned to anyone new after this date.",
          model: "expire_date",
          required: true,
          minDate: "today",
        },
      ];
    });

    onMounted(async () => {
      formAssignments.value = await fb.getCollection("form_assignments");
      users.value = await fb.getCollection("users");
    });

    const createFormAssignment = async (response) => {
      const {
        form_id,
        release_date,
        expire_date,
        users,
        organizations,
        groups,
      } = response;

      const formAssignmentData = {
        created_date: Date.now(),
        form_id,
        form_type: forms.value[form_id].type,
        release_date,
        expire_date,
        target: {
          users: users,
          organizations: organizations,
          groups: groups,
        },
      };

      try {
        // Create the form assignment on the db
        const formAssignment = await fb.db
          .collection("form_assignments")
          .add(formAssignmentData);
        formAssignmentData._id = formAssignment.id;

        // Create the form responses
        const formResponses = await createFormResponses(formAssignmentData);

        if (formResponses) {
          // Update the page
          formAssignments.value.push(formAssignmentData);

          showModal.value = false;
          alert.color = "success";
          alert.message = "form assignment added";
        } else {
          await fb.db
            .collection("form_assignments")
            .doc(formAssignment.id)
            .delete();

          formMessage.value =
            "Error creating form responses for form assignments.";
        }

        // show the message only for 6 seconds
        setTimeout(() => (alert.message = ""), 6000);
      } catch (e) {
        console.log(e);
        formMessage.value = "Error adding form assignment";
      }
    };

    const createFormResponses = async (formAssignment) => {
      const formResponseData = fb.getBlankFormResponse(formAssignment);

      const assigned =
        formAssignment.form_type === "organization"
          ? fb.getAssignedOrgs(formAssignment.target, organizations.value)
          : fb.getAssignedUsers(
              formAssignment.target,
              organizations.value,
              users.value
            );

      return await fb.createFormResponses(formResponseData, assigned);
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
      selectedFormAssignments,
      selectedTab,
      showModal,
      tabs,
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
