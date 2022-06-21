<template>
  <div
    v-if="selectedFormResponses.length === 0"
    data-cy="forms-panel-block"
    class="panel-block is-justify-content-center"
  >
    <span>No forms here</span>
  </div>
  <div
    v-for="(formResponse, idx) in selectedFormResponses"
    v-else
    :key="'formResponse-' + idx"
    data-cy="forms-panel-block"
    class="panel-block"
  >
    <div class="level form-row" data-cy="form-row">
      <div class="level-left">
        <p class="level-item is-size-5" data-cy="form-title">
          {{ formResponse.form.title }}
        </p>
      </div>

      <div class="level-right has-text-centered is-flex-shrink-1 mt-0">
        <div class="panel-tags">
          <PanelTag
            v-if="formResponse.form.type === 'organization'"
            label="organization-level"
          />
          <PanelTag
            v-if="user.admin && formResponse.release_date"
            :class="{
              'is-success is-light': formResponse.release_date <= today,
            }"
            label="release date"
            :value="formResponse.release_date"
          />
          <PanelTag
            v-if="formResponse.response[MUNI_QUESTION_MODEL]"
            label="municipality"
            :value="formResponse.response[MUNI_QUESTION_MODEL]"
          />
          <PanelTag
            v-if="formResponse.response[GEOID_QUESTION_MODEL]"
            label="block group"
            :value="formResponse.response[GEOID_QUESTION_MODEL]"
          />
          <PanelTag
            :class="{
              'is-warning': formResponse.status === 'Not Started',
              'is-info': formResponse.status === 'Draft',
              'is-success': formResponse.status === 'Submitted',
            }"
            label="status"
            :value="formResponse.status"
          />
          <PanelTag
            v-if="formResponse.status !== 'Not Started'"
            :label="
              formResponse.status === 'Draft' ? 'last updated' : 'submitted'
            "
            :value="
              new Date(formResponse.last_updated).toISOString().slice(0, 10)
            "
          />
          <PanelTag
            v-if="formResponse.user_submitted"
            label="SUBMITTED BY"
            :value="formResponse.user_submitted"
          />
        </div>
        <div class="level-item">
          <button
            v-if="
              !readOnly &&
              formResponse.status !== 'Submitted' &&
              (formResponse.form.type === 'user' ||
                (formResponse.form.type === 'organization' &&
                  userRole === 'champion'))
            "
            class="button is-primary level-item"
            data-cy="launch-form-button"
            type="button"
            @click="$emit('launchForm', formResponse)"
          >
            {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
          </button>
          <button
            v-else
            class="button is-primary is-light level-item"
            data-cy="review-form-button"
            type="button"
            @click="$emit('reviewForm', formResponse)"
          >
            Review Form
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PanelTag from "@/components/PanelTag.vue";
import { GEOID_QUESTION_MODEL, MUNI_QUESTION_MODEL } from "@/utils/utils.js";
import { useStore } from "vuex";
import { computed } from "vue";

defineProps({
  selectedFormResponses: Array,
  readOnly: Boolean,
});

const store = useStore();
const user = computed(() => store.state.user);
const userRole = computed(() =>
  user.value.data ? user.value.data.role : "user"
);
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.form-row {
  width: 100%;
}

.panel-tags {
  padding: 0 0.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;

  @include mobile {
    justify-content: center;
  }
}
</style>
