<template>
  <teleport to="body">
    <div v-esc="() => (closeFormRequest += 1)">
      <div
        v-if="'form' in formResponse"
        class="modal is-active"
        data-cy="active-form-modal"
      >
        <div class="modal-background"></div>
        <div class="modal-card is-family-secondary">
          <header class="modal-card-head">
            <p class="modal-card-title" data-cy="active-form-title">
              {{ formResponse.form.title }}
            </p>
            <button
              class="delete"
              data-cy="close-form"
              aria-label="close"
              @click="closeFormRequest += 1"
            ></button>
          </header>
          <section class="modal-card-body" data-cy="form-body">
            <JSONForm
              :init-schema="formResponse.form.questions"
              :read-only="
                formResponse.status === 'Submitted' ||
                (formResponse.form.type === 'organization' &&
                  userRole !== 'champion')
              "
              :init-value="formResponse.response"
              :close-request="closeFormRequest"
              @alt="updateFormResponse($event, 'Draft')"
              @submitted="updateFormResponse($event, 'Submitted')"
              @close="closeForm"
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
  </teleport>
</template>

<script>
import { ref, computed, toRefs } from "vue";
import { useStore } from "vuex";

import { esc } from "@/directives/escape";
import JSONForm from "@/components/form/JSONForm.vue";

export default {
  components: {
    JSONForm,
  },
  directives: {
    ...esc,
  },
  props: {
    formResponse: {
      type: Object,
      required: true,
    },
  },
  emits: ["update-form-response"],
  setup(props, { emit }) {
    const { formResponse } = toRefs(props);

    const store = useStore();
    const user = computed(() => store.state.user);
    const userEmail = computed(() =>
      user.value.data ? user.value.data.email : ""
    );
    const userRole = computed(() =>
      user.value.data ? user.value.data.role : "user"
    );

    const closeFormRequest = ref(0);
    const formMessage = ref("");

    const updateFormResponse = async (response, status) => {
      const users_edited = formResponse.value.users_edited ?? [];
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
        ...formResponse.value,
        ...updateData,
      };

      try {
        const _id = await store.dispatch(
          "updateFormResponse",
          updatedFormResponse
        );
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

    return {
      closeFormRequest,
      formMessage,
      updateFormResponse,
      userRole,
      closeForm,
    };
  },
};
</script>
