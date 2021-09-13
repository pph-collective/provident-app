<template>
  <Loading :loading="loading" />
  <div class="container form-assignments">
    <div
      v-if="alert.message"
      :class="['notification', 'mt-4', 'is-' + alert.color]"
      data-cy="alert-message"
    >
      <button class="delete" @click="dismissAlert"></button>
      {{ alert.message }}
    </div>
    <section>
      <div class="panel is-primary m-4 has-background-white">
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
            v-for="tab in Object.keys(tabs)"
            :key="tab"
            :class="{ 'is-active': selectedTab === tab }"
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
            <div class="level mb-2">
              <div class="level-left">
                <p
                  v-if="assignment.form_id in forms"
                  class="level-item is-size-6"
                >
                  <b data-cy="form-title">
                    {{ forms[assignment.form_id].title }}
                  </b>
                </p>
              </div>
              <div class="level-right has-text-centered">
                <PanelTag
                  label="release date"
                  :value="assignment.release_date"
                  class="is-success"
                />
                <PanelTag
                  label="expire date"
                  :value="assignment.expire_date"
                  class="is-danger"
                />
              </div>
            </div>
            <div class="is-flex is-flex-wrap-wrap">
              <div
                v-for="(target_list, category) in nonEmptyVals(
                  assignment.target
                )"
                :key="category"
                class="m-1"
              >
                <div class="tags has-addons">
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
                :showAltButton="false"
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
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import { esc } from "@/directives/escape";
import utils from "@/utils/utils";
import formAssignmentUtils from "@/utils/formAssignment";

import JSONForm from "@/components/form/JSONForm.vue";
import Loading from "@/components/Loading.vue";
import PanelTag from "@/components/PanelTag.vue";

export default {
  components: {
    JSONForm,
    Loading,
    PanelTag,
  },
  directives: {
    ...esc,
  },
  setup() {
    const alert = reactive({ color: "", message: "" });
    const closeFormRequest = ref(0);
    const formMessage = ref("");
    const showModal = ref(false);

    const store = useStore();
    const forms = computed(() => store.state.forms);
    const organizations = computed(() => store.state.organizations);
    const users = computed(() => store.getters.approvedUsers);
    const formAssignments = computed(() => store.state.formAssignments);
    const loading = computed(
      () => users.value.length === 0 || formAssignments.value.length === 0
    );

    const today = utils.today();

    const tabs = {
      "Active (Not Expired)": (formAssignment) =>
        today <= formAssignment.expire_date,
      Released: (formAssignment) =>
        formAssignment.release_date <= today &&
        today <= formAssignment.expire_date,
      Expired: (formAssignment) => today > formAssignment.expire_date,
      All: () => true,
    };
    const selectedTab = ref(Object.keys(tabs)[0]);
    const selectedFormAssignments = computed(() =>
      formAssignments.value.filter(tabs[selectedTab.value])
    );

    const dismissAlert = () => {
      alert.message = "";
    };

    const formQuestions = computed(() => {
      if (
        Object.keys(forms.value).length === 0 ||
        users.value.length === 0 ||
        organizations.value.length === 0
      ) {
        return [];
      }

      const formOptions = Object.values(forms.value)
        .map((f) => {
          return { value: f._id, label: `${f.title} (type: ${f.type})` };
        })
        .sort(utils.sortByProperty("label"));

      const userTypeForms = Object.values(forms.value)
        .filter((f) => f.type === "user")
        .map((f) => f._id);

      const userOptions = store.getters.formUserOptions;
      const organizationOptions = store.getters.formOrganizationOptions;
      const groups = formAssignmentUtils.TARGET_GROUPS;

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
          model: "target_groups",
          options: groups,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to organizations",
          model: "target_organizations",
          options: organizationOptions,
        },
        {
          component: "Select",
          multiple: true,
          label: "Assign to users",
          help_text: "Only user forms can be directly assigned to users.",
          model: "target_users",
          default: [],
          options: userOptions,
          condition: `(model) => model.form_id && ${JSON.stringify(
            userTypeForms
          )}.includes(model.form_id)`,
        },
        {
          component: "Date",
          label: "Release Date",
          help_text: "The date when the form will be released to users.",
          model: "release_date",
          required: true,
          min_date: "today",
        },
        {
          component: "Date",
          label: "Expire Date",
          help_text:
            "The due date of the form and the expire date of the form assignment. The form won't be assigned to anyone new after this date.",
          model: "expire_date",
          required: true,
          min_date: "today",
        },
        {
          component: "Checkbox",
          label: "Send Email?",
          help_text:
            "Send an email to targeted users on the release date notifying them of this form.",
          model: "send_email",
          options: ["Yes, send a notification"],
        },
      ];
    });

    const createFormAssignment = async ({
      form_id,
      release_date,
      expire_date,
      target_users,
      target_organizations,
      target_groups,
      send_email,
    }) => {
      loading.value = true;
      const form_type = forms.value[form_id].type;

      const target = {
        users: target_users,
        organizations: target_organizations,
        groups: target_groups,
      };

      const formAssignmentData = {
        created_date: Date.now(),
        form_id,
        form_type,
        release_date,
        expire_date,
        target,
      };

      let emails = [];
      try {
        // Create the form assignment on the db
        formAssignmentData._id = await fb.addFormAssignment(formAssignmentData);

        emails = await formAssignmentUtils.addFormResponses(
          formAssignmentData,
          organizations.value,
          users.value
        );

        // Update the page
        formAssignments.value.unshift(formAssignmentData);

        showModal.value = false;
        alert.color = "success";
        alert.message = "form assignment added";

        // show the message only for 6 seconds
        setTimeout(() => (alert.message = ""), 6000);

        // add an email to the queue
        if (send_email.length > 0) {
          const formTitle = forms.value[form_id].title;
          await fb.createEmail({
            subject: `PROVIDENT New Form: ${formTitle}`,
            body: `<p>A form, <em>${formTitle}</em>, has been assigned to ${
              form_type === "user" ? "you" : "your organization"
            }. Check out the form on <a href='${
              location.origin
            }/snack/forms'>PROVIDENT</a></p>`,
            to: emails,
            sendDate: release_date,
          });
        }
      } catch (err) {
        console.log(err);

        if (formAssignmentData._id) {
          await fb.db
            .collection("form_assignments")
            .doc(formAssignmentData._id)
            .delete();
        }

        // only show the form error if the error was with form assignment, not email
        if (showModal.value) {
          formMessage.value =
            "Error creating form responses for form assignments.";
        }
      }

      loading.value = false;
    };

    const nonEmptyVals = (obj) => {
      const res = {};
      if (obj) {
        for (const [k, v] of Object.entries(obj)) {
          if (v.length > 0) {
            res[k] = v;
          }
        }
      }

      return res;
    };

    return {
      alert,
      closeFormRequest,
      createFormAssignment,
      dismissAlert,
      formAssignments,
      formMessage,
      formQuestions,
      forms,
      loading,
      nonEmptyVals,
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
