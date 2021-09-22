<template>
  <Loading :loading="organizations.length === 0 || loading" />
  <div class="container">
    <section class="section">
      <h1 class="title">Organization Management</h1>
      <div class="content">
        <button
          class="button is-primary"
          data-cy="create-button"
          @click="showModal = true"
        >
          + Create
        </button>
      </div>

      <table class="table" data-cy="organization-table">
        <thead>
          <tr>
            <th v-for="field in fields" class="is-clickable" :key="field">
              <span class="icon-text">
                <span>{{ field }}</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in organizations" :key="org.name">
            <td>{{ org.name }}</td>
            <td>
              <i
                :class="['fas', org.intervention_arm ? 'fa-check' : 'fa-times']"
              ></i>
            </td>
            <td>
              <span
                v-for="municipality in org.municipalities.sort()"
                class="tag"
                :key="municipality"
              >
                {{ municipality }}
              </span>
            </td>
          </tr>
          <tr v-if="organizations.length === 0">
            <td :colspan="fields.length">
              <div class="is-flex is-justify-content-center">
                <p>No organizations found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

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
            <p class="modal-card-title">Create New Organization</p>
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
              @submitted="createOrganization($event)"
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
    </section>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";

import { esc } from "@/directives/escape";
import utils from "@/utils/utils";
import formAssignmentUtils from "@/utils/formAssignment";

import JSONForm from "@/components/form/JSONForm.vue";
import Loading from "@/components/Loading.vue";

export default {
  components: {
    JSONForm,
    Loading,
  },
  directives: {
    ...esc,
  },
  setup() {
    const store = useStore();
    const formAssignments = computed(() => store.state.formAssignments);
    const municipalities = computed(() => store.getters.municipalities);
    const organizations = computed(() => store.state.organizations);

    const fields = ["Name", "Intervention Arm", "Municipalities"];
    const closeFormRequest = ref(0);
    const formMessage = ref("");
    const showModal = ref(false);
    const loading = ref(false);

    const today = utils.today();

    const createOrganization = async ({ name, group, municipalities }) => {
      loading.value = true;

      const organization = {
        name,
        intervention_arm: group === "intervention",
        municipalities,
      };

      try {
        await store.dispatch("addOrg", organization);

        await formAssignmentUtils.addFormResponsesForApproved(
          { organization },
          formAssignments.value,
          organizations.value,
          today
        );
        showModal.value = false;

        store.dispatch("addNotification", {
          color: "success",
          message: `Success! Organization added: ${name}`,
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

    const formQuestions = computed(() => [
      {
        component: "TextInput",
        label: "Organization's Name",
        model: "name",
        required: true,
        validations: `yup.string().uppercase().notOneOf(${JSON.stringify(
          organizations.value.map((org) => org.name.toUpperCase())
        )}, 'Organization already exists.')`,
      },
      {
        component: "Radio",
        label: "Intervention or Control Group?",
        model: "group",
        options: ["intervention", "control"],
        required: true,
      },
      {
        component: "Select",
        multiple: true,
        label: "Municipalities",
        model: "municipalities",
        options: municipalities,
      },
    ]);

    return {
      createOrganization,
      closeFormRequest,
      fields,
      formMessage,
      formQuestions,
      loading,
      municipalities,
      organizations,
      showModal,
    };
  },
};
</script>
