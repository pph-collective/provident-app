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
              @click="activeFormResponse = assessment"
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
      class="button is-primary mt-4"
      data-cy="launch-form-button"
      type="button"
      :disabled="!activeGeoid"
      @click="createNewAssessment"
    >
      Start New Assessment
    </button>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    :form-questions="assessmentQuestions"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, toRefs, computed, onMounted } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import FormModal from "@/components/form/Modal.vue";

const FORM_ID = "neighborhood_rapid_assessment";

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

    const assessmentForm = ref({});
    onMounted(async () => {
      assessmentForm.value = await fb.getForm(FORM_ID);
    });

    const assessmentQuestions = computed(
      () => assessmentForm.value.questions ?? []
    );

    const completedAssessments = computed(() => {
      const formResponses = store.state.user.formResponses;
      return formResponses
        .filter((response) => response.form_id === FORM_ID)
        .sort((a, b) => b.last_updated - a.last_updated);
    });

    const bgAssessments = computed(() => {
      return completedAssessments.value.filter(
        (assessment) =>
          assessment.response.neighborhood_id === activeGeoid.value
      );
    });

    const createNewAssessment = () => {
      const { title, type } = assessmentForm.value;
      activeFormResponse.value = {
        form_id: FORM_ID,
        title,
        type,
        status: "Not Started",
        response: { neighborhood_id: activeGeoid.value },
      };
    };

    const formatDate = (dateNumber) => {
      const d = new Date(dateNumber);
      return d.toDateString();
    };

    return {
      userRole,
      bgAssessments,
      activeFormResponse,
      assessmentQuestions,
      createNewAssessment,
      formatDate,
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
