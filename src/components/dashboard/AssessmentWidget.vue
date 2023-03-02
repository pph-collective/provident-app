<template>
  <div class="is-fullheight is-flex is-flex-direction-column">
    <div class="form-response-container is-flex-grow-1">
      <table
        v-if="bgFormResponses.length > 0"
        class="table is-fullwidth is-narrow"
      >
        <tbody>
          <tr
            v-for="formResponse in bgFormResponses"
            :key="formResponse._id"
            data-cy="form-response-row"
            class="has-text-centered"
          >
            <td>
              <i
                :class="{
                  'fas fa-tasks': formResponse.form.title === PLAN_FORM,
                  'fas fa-clipboard':
                    formResponse.form.title === ASSESSMENT_FORM,
                  'fas fa-star-half':
                    formResponse.form.title === MIDWAY_FOLLOWUP_FORM,
                  'fas fa-star': formResponse.form.title === FOLLOWUP_FORM,
                }"
              />
            </td>
            <td class="has-text-weight-bold is-size-6-7 is-align-items-center">
              {{ FORM_ID_TO_SHORT_TITLE[formResponse.form.title] }}
            </td>
            <td class="has-text-weight-bold">
              <span class="tag">{{
                formatDate(formResponse.last_updated)
              }}</span>
            </td>
            <td>
              <button
                class="button is-primary is-small"
                :class="[
                  formResponse.status === 'Submitted' || userRole === 'user'
                    ? 'is-light'
                    : '',
                ]"
                type="button"
                @click="
                  launchForm(
                    formResponse,
                    formResponse.status === 'Submitted' || userRole === 'user'
                  )
                "
              >
                {{
                  formResponse.status === "Submitted" || userRole === "user"
                    ? "Review"
                    : "Continue"
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="activeGeoid" class="widget-message">
        No Assessments or Plans Found for {{ activeGeoid }}
      </p>
      <p v-else class="widget-message">
        Select a block group on the map to see its completed assessments and
        plans
        {{ userRole === "champion" ? "or start a new one" : "" }}
      </p>
    </div>
    <div
      v-if="userRole === 'champion'"
      class="is-flex is-justify-content-center is-flex-wrap-wrap"
    >
      <button
        id="new-assessment"
        class="button is-primary mt-2 mx-1"
        type="button"
        :disabled="!activeGeoid"
        @click="createNewBGForm('neighborhood_rapid_assessment')"
      >
        Start New Assessment
      </button>
      <button
        id="new-plan"
        class="button is-success mt-2 mx-1"
        type="button"
        :disabled="!activeGeoid"
        @click="createNewBGForm('resource_plan')"
      >
        Start New Plan
      </button>
    </div>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, toRefs, computed } from "vue";
import { useStore } from "vuex";

import {
  sortByProperty,
  today,
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
} from "@/utils/utils.js";
import fb from "@/firebase.js";

import FormModal from "@/components/form/Modal.vue";

const ASSESSMENT_FORM = "Neighborhood Rapid Assessment";
const PLAN_FORM = "Six Month Resource Plan";
const MIDWAY_FOLLOWUP_FORM = "Mid-way Followup to the Six Month Resource Plan";
const FOLLOWUP_FORM = "Followup to Six Month Resource Plan";

const FORM_ID_TO_SHORT_TITLE = {
  [ASSESSMENT_FORM]: "Assessment",
  [PLAN_FORM]: "Plan",
  [MIDWAY_FOLLOWUP_FORM]: "Mid-way Plan Followup",
  [FOLLOWUP_FORM]: "Plan Followup",
};

export default {
  components: {
    FormModal,
  },
  props: {
    activeGeoid: {
      type: String,
      required: true,
    },
    activeMuni: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { activeGeoid, activeMuni } = toRefs(props);

    const store = useStore();
    const userRole = computed(() =>
      store.state.user.data ? store.state.user.data.role : "user"
    );

    const activeFormResponse = ref({});
    const activeFormReadOnly = ref(true);

    const completedForms = computed(() => {
      const formResponses = store.state.user.formResponses;
      return formResponses
        .filter((response) =>
          Object.keys(FORM_ID_TO_SHORT_TITLE).includes(response.form.title)
        )
        .sort(sortByProperty("last_updated"))
        .reverse();
    });

    const bgFormResponses = computed(() => {
      return completedForms.value.filter(
        (assessment) =>
          assessment.response[GEOID_QUESTION_MODEL] === activeGeoid.value &&
          assessment.response[MUNI_QUESTION_MODEL] === activeMuni.value
      );
    });

    const userOrganization = computed(() =>
      store.state.user.data ? store.state.user.data.organization : ""
    );

    const createNewBGForm = (form_id) => {
      activeFormResponse.value = {
        organization: userOrganization,
        form: store.state.forms[form_id],
        release_date: today(),
        status: "Not Started",
        response: {
          [GEOID_QUESTION_MODEL]: activeGeoid.value,
          [MUNI_QUESTION_MODEL]: activeMuni.value,
        },
      };
      activeFormReadOnly.value = false;
      fb.logActivity(
        store.state.user.data.email,
        `create ${form_id} form`,
        activeGeoid.value
      );
    };

    const formatDate = (dateNumber) => {
      const d = new Date(dateNumber);
      return d.toLocaleDateString();
    };

    const launchForm = (formResponse, readOnly) => {
      activeFormReadOnly.value = readOnly;
      activeFormResponse.value = formResponse;
      fb.logActivity(
        store.state.user.data.email,
        `launch ${formResponse.form.title} form`,
        formResponse.title
      );
    };

    return {
      ASSESSMENT_FORM,
      FORM_ID_TO_SHORT_TITLE,
      PLAN_FORM,
      MIDWAY_FOLLOWUP_FORM,
      FOLLOWUP_FORM,
      activeFormReadOnly,
      activeFormResponse,
      bgFormResponses,
      userRole,
      createNewBGForm,
      formatDate,
      launchForm,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.form-response-container {
  min-height: 150px;
  max-height: 20vh;

  @include touch {
    max-height: 65vh;
  }

  max-width: 100%;
  border-style: solid;
  border-color: grey;
  border-width: 1px;
  border-radius: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 0.5rem;
  position: relative;
}

table {
  border-radius: 6px;
}

table td {
  vertical-align: middle !important;
  padding-left: 1px !important;
  padding-right: 1px !important;
}

.widget-message {
  font-style: italic;
  text-align: center;
  padding: 0 1em;
  display: grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  grid-template-areas: ".";
  position: absolute;
  top: 0;
}

.is-fullheight {
  height: 100%;
}
</style>
