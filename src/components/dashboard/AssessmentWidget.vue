<template>
  <div class="form-response-container">
    <table v-if="bgAssessments.length > 0" class="table is-fullwidth">
      <tbody>
        <tr v-for="assessment in bgAssessments" :key="assessment._id">
          <th class="has-text-centered">
            {{ formatDate(assessment.last_updated) }}
          </th>
          <td class="is-flex is-justify-content-center">
            <button
              class="button is-primary is-small"
              :class="[
                assessment.status === 'Submitted' || userRole === 'user'
                  ? 'is-light'
                  : '',
              ]"
              type="button"
              @click="launchForm(assessment)"
            >
              {{
                assessment.status === "Submitted" || userRole === "user"
                  ? "Review"
                  : "Continue"
              }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="activeGeoid" class="assessment-message">
      No Assessments Found for {{ activeGeoid }}
    </p>
    <p v-else class="assessment-message">
      Select a block group on the map to see its completed assessments or start
      a new one
    </p>
  </div>
  <div class="is-flex is-justify-content-center">
    <button
      v-if="userRole === 'champion'"
      id="new-assessment"
      class="button is-primary mt-4"
      type="button"
      :disabled="!activeGeoid"
      @click="createNewAssessment"
    >
      Start New Assessment
    </button>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, toRefs, computed } from "vue";
import { useStore } from "vuex";

import utils from "@/utils/utils.js";
import fb from "@/firebase.js";

import FormModal from "@/components/form/Modal.vue";

const FORM_ID = "neighborhood_rapid_assessment";
const GEOID_QUESTION_MODEL = "neighborhood_id";

export default {
  components: {
    FormModal,
  },
  props: {
    activeGeoid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { activeGeoid } = toRefs(props);

    const store = useStore();
    const userRole = computed(() =>
      store.state.user.data ? store.state.user.data.role : "user"
    );

    const activeFormResponse = ref({});

    const assessmentForm = computed(() => {
      const form = store.state.forms[FORM_ID];

      if (form) {
        const geoidQuestion = form.questions.find(
          (question) => question.model === GEOID_QUESTION_MODEL
        );
        geoidQuestion.readOnly = true;
      }

      return form ?? {};
    });

    const completedAssessments = computed(() => {
      const formResponses = store.state.user.formResponses;
      return formResponses
        .filter((response) => response.form._id === FORM_ID)
        .sort(utils.sortByProperty("last_updated"))
        .reverse();
    });

    const bgAssessments = computed(() => {
      return completedAssessments.value.filter(
        (assessment) =>
          assessment.response.neighborhood_id === activeGeoid.value
      );
    });

    const createNewAssessment = () => {
      activeFormResponse.value = {
        form: assessmentForm.value,
        status: "Not Started",
        response: { neighborhood_id: activeGeoid.value },
      };
      fb.logActivity(
        store.state.user.data.email,
        "create NRA",
        activeGeoid.value
      );
    };

    const formatDate = (dateNumber) => {
      const d = new Date(dateNumber);
      return d.toDateString();
    };

    const launchForm = (formResponse) => {
      activeFormResponse.value = formResponse;
      fb.logActivity(
        store.state.user.data.email,
        "launch NRA form",
        formResponse._id
      );
    };

    return {
      activeFormResponse,
      assessmentForm,
      bgAssessments,
      createNewAssessment,
      formatDate,
      launchForm,
      userRole,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-response-container {
  height: 150px;
  border-style: solid;
  border-color: grey;
  border-width: 1px;
  border-radius: 6px;
  overflow-y: scroll;
  position: relative;
}

table {
  border-radius: 6px;
}

.assessment-message {
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
</style>
