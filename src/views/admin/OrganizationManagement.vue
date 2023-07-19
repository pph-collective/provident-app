<template>
  <Loading :loading="organizations.length === 0 || loading" />
  <div class="org-management container">
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

      <div class="b-table">
        <div class="table-wrapper has-mobile-cards">
          <table class="table" data-cy="organization-table">
            <thead>
              <tr>
                <th
                  v-for="field in fields"
                  :key="field.label"
                  class="is-clickable"
                >
                  <span class="icon-text">
                    <span>{{ field.label }}</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="org in organizations" :key="org.name">
                <td
                  v-for="field in fields"
                  :key="field.label"
                  :data-label="fields.label"
                  class="is-flex-wrap-wrap"
                >
                  <div v-if="field.code === 'municipalities'">
                    <span
                      v-if="org.municipalities.length === 0"
                      class="tag is-info is-rounded is-light m-1"
                    >
                      All of Rhode Island
                    </span>
                    <span
                      v-for="municipality in org.municipalities.sort()"
                      :key="municipality"
                      class="tag is-info is-rounded is-light m-1"
                    >
                      {{ municipality }}
                    </span>
                  </div>
                  <i
                    v-else-if="typeof org[field.code] === 'boolean'"
                    :class="[
                      'fas',
                      org.intervention_arm ? 'fa-check' : 'fa-times',
                    ]"
                  />
                  <div v-else>
                    {{ org[field.code] }}
                  </div>
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
        </div>
      </div>

      <div
        v-if="showModal && formQuestions.length > 0"
        v-esc="() => (closeFormRequest += 1)"
        class="modal"
        :class="{ 'is-active': showModal }"
        data-cy="active-form-modal"
      >
        <div class="modal-background" />
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Create New Organization</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeFormRequest += 1"
            />
          </header>
          <section class="modal-card-body">
            <JSONForm
              v-if="showModal"
              :init-schema="formQuestions"
              :init-value="{}"
              :read-only="false"
              :show-alt-button="false"
              :close-request="closeFormRequest"
              @submitted="createOrganization"
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
import utils from "../../utils/utils";
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
    const organizations = computed(() => store.state.organizations);
    const allMunicipalities = utils.MUNICIPALITIES;

    const fields = [
      {
        label: "Name",
        code: "name",
      },
      {
        label: "Tier",
        code: "tier",
      },
      {
        label: "Intervention Arm",
        code: "intervention_arm",
      },
      {
        label: "Municipalities",
        code: "municipalities",
      },
    ];
    const closeFormRequest = ref(0);
    const formMessage = ref("");
    const showModal = ref(false);
    const loading = ref(false);

    const createOrganization = async ({
      name,
      tier,
      group,
      municipalities = [],
    }) => {
      loading.value = true;

      const organization = {
        name,
        tier,
        intervention_arm: group === "intervention",
        municipalities,
      };

      try {
        await store.dispatch("addOrg", organization);

        await formAssignmentUtils.addFormResponsesForApproved(
          "organization",
          organization,
          formAssignments.value,
          organizations.value
        );
        showModal.value = false;

        store.dispatch("addNotification", {
          color: "success",
          message: `Success! Organization added: ${name}`,
        });
      } catch (err) {
        console.log(err);
        formMessage.value = "Error creating organization";
        setTimeout(() => (formMessage.value = ""), 6000);
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
        component: "Select",
        label: "What tier is this organization?",
        model: "tier",
        options: ["1", "2"],
        required: true,
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
        options: allMunicipalities,
      },
    ]);

    return {
      createOrganization,
      closeFormRequest,
      fields,
      formMessage,
      formQuestions,
      loading,
      organizations,
      showModal,
    };
  },
};
</script>
