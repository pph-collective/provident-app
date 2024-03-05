<template>
  <teleport to="body">
    <div v-esc="() => (closeFormRequest += 1)">
      <div
        v-if="'form' in formResponse"
        class="modal is-active"
        data-cy="active-form-modal"
      >
        <div class="modal-background" />
        <div class="modal-card is-family-secondary">
          <header class="modal-card-head">
            <p class="modal-card-title" data-cy="active-form-title">
              {{ formResponse.form.title }}
            </p>
            <button
              v-if="printable"
              class="button is-small is-primary mx-2"
              @click="print"
            >
              Print
            </button>
            <button
              class="delete"
              data-cy="close-form"
              aria-label="close"
              @click="closeFormRequest += 1"
            />
          </header>
          <section class="modal-card-body" data-cy="form-body">
            <PrintSection :printable="printable">
              <div class="card-content user-submitted">
                <p v-if="formResponse.user_submitted">
                  <em>Submitted by {{ formResponse.user_submitted }}</em>
                </p>
                <p v-if="formResponse.users_edited?.length > 0">
                  <em>Edited by {{ formResponse.users_edited.join(", ") }}</em>
                </p>
                <p v-if="formResponse.last_updated" class="only-printed">
                  <em
                    >Last updated
                    {{
                      new Date(formResponse.last_updated).toLocaleString()
                    }}</em
                  >
                </p>
              </div>
              <div class="only-printed">
                <h2 class="title is-2">
                  {{ formResponse.form.title }}
                </h2>
                <h3 class="subtitle is-3">
                  <p v-if="formResponse.response[MUNI_QUESTION_MODEL]">
                    <b>Neighborhood ID:</b>
                    {{ formResponse.response[MUNI_QUESTION_MODEL] }}
                  </p>
                  <p v-if="formResponse.response[GEOID_QUESTION_MODEL]">
                    <b>Municipality:</b>
                    {{ formResponse.response[GEOID_QUESTION_MODEL] }}
                  </p>
                </h3>
                <hr />
                <div
                  class="is-flex is-justify-content-center is-align-items-center"
                >
                  <BGMap
                    v-if="formResponse.response[GEOID_QUESTION_MODEL]"
                    :block-group="formResponse.response[GEOID_QUESTION_MODEL]"
                    :min-height="500"
                    :min-width="750"
                    :dataset="dataset.cbg"
                  />
                </div>
                <div class="columns is-multiline my-4">
                  <div
                    v-for="landmark in landmarks"
                    :key="landmark.street_address"
                    class="column is-one-third my-1"
                  >
                    {{ landmark.location_name }}<br />
                    {{ landmark.street_address }}<br />
                    {{ landmark.city }}, RI {{ landmark.postal_code }} <br />
                  </div>
                </div>
                <div
                  v-if="formResponse.response[GEOID_QUESTION_MODEL]"
                  class="page-break"
                />
              </div>
              <div class="not-printed">
                <BGMap
                  v-if="formResponse.response[GEOID_QUESTION_MODEL]"
                  :block-group="formResponse.response[GEOID_QUESTION_MODEL]"
                  :min-height="200"
                  :max-height="350"
                />
              </div>
              <JSONForm
                :init-schema="formResponse.form.questions"
                :read-only="readOnly"
                :init-value="formResponse.response"
                :form-title="formResponse.form.title"
                :last-updated="formResponse.last_updated"
                :close-request="closeFormRequest"
                :form-message="formMessage"
                @alt="updateFormResponse($event, 'Draft')"
                @submitted="updateFormResponse($event, 'Submitted')"
                @close="closeForm"
              />
            </PrintSection>
          </section>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProvidentStore } from "../../store";

import { esc as vEsc } from "@/directives/escape";
import JSONForm from "@/components/form/JSONForm.vue";
import BGMap from "@/components/dashboard/BGMap.vue";
import PrintSection from "@/components/PrintSection.vue";
import { GEOID_QUESTION_MODEL, MUNI_QUESTION_MODEL } from "@/utils/utils.js";

const props = defineProps({
  formResponse: {
    type: Object,
    required: true,
  },
  readOnly: {
    type: Boolean,
  },
});

const emit = defineEmits(["update-form-response"]);

const store = useProvidentStore();
const user = computed(() => store.user);
const userEmail = computed(() =>
  user.value.data ? user.value.data.email : "",
);
const dataset = computed(() => {
  if (store.dataset.cbg.length === 0) {
    store.fetchModelData();
  }

  return store.dataset;
});

const landmarks = computed(() => {
  const blockGroup = props.formResponse.response[GEOID_QUESTION_MODEL];

  if (dataset.value !== undefined && blockGroup !== undefined) {
    return dataset.value.cbg.find((c) => c.bg_id === blockGroup)?.landmarks;
  }

  return [];
});

const closeFormRequest = ref(0);
const formMessage = ref("");

const updateFormResponse = async (response, status) => {
  const users_edited = props.formResponse.users_edited ?? [];
  if (!users_edited.includes(userEmail.value))
    users_edited.push(userEmail.value);

  const updateData = {
    response,
    users_edited,
    user_submitted: status === "Submitted" ? userEmail.value : "",
    last_updated: Date.now(),
    status,
  };

  const updatedFormResponse = {
    ...props.formResponse,
    ...updateData,
  };

  try {
    const _id = await store.updateFormResponse(updatedFormResponse);
    formMessage.value = "Form successfully saved";

    // update activeFormResponse
    if (status === "Submitted") {
      emit("update-form-response", {});
    } else {
      emit("update-form-response", { _id, ...updatedFormResponse });
    }
  } catch (e) {
    console.log(e);
    formMessage.value = "Error saving form";
  }

  // show the message only for 6 seconds
  setTimeout(() => (formMessage.value = ""), 6000);
};

const closeForm = () => {
  emit("update-form-response", {});
  formMessage.value = "";
};

const print = () => {
  // HACK: Get all of the printable textareas and then replace them with divs
  document.querySelectorAll(".printable textarea").forEach((element) => {
    const div = document.createElement("div");
    div.textContent = element.value;
    element.parentNode.replaceChild(div, element);
  });

  if (document.queryCommandSupported("print")) {
    document.execCommand("print", true, null);
  } else {
    window.print();
  }
};

const printable = computed(() => props.formResponse.status === "Submitted");
</script>

<style lang="scss" scoped>
.user-submitted {
  padding-top: 0rem;
  padding-bottom: 0rem;
  text-align: right;
}
</style>
