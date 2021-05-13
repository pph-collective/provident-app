<template>
  <div class="panel is-primary m-4 has-background-white">
    <p class="panel-heading">
      I am forms!
    </p>

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
      v-if="Object.keys(selectedForms).length === 0"
      class="panel-block is-justify-content-center"
    >
      <span>No forms here</span>
    </div>
    <div
      v-else
      v-for="(form, id) in selectedForms"
      :key="'form-' + id"
      class="panel-block"
    >
      <div class="level form-row">
        <div class="level-left">
          <p class="level-item is-size-5">
            {{ form.title }}
          </p>
        </div>

        <div class="level-right">
          <span class="level-item tag">
            <p><strong>STATUS:</strong> {{ form.status }}</p>
          </span>
          <button
            v-if="form.status !== 'Submitted'"
            class="button is-primary level-item"
            type="button"
            @click="activeForm = form"
          >
            Launch Form
          </button>
          <button
            v-else
            class="button is-primary is-light level-item"
            type="button"
            @click="activeForm = form"
          >
            Review Form
          </button>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div v-if="activeForm.questions" class="modal is-active">
      <div class="modal-background" @click="activeForm = {}"></div>
      <div class="modal-content">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ activeForm.title }}</p>
          <button
            class="delete"
            aria-label="close"
            @click="activeForm = {}"
          ></button>
        </header>
        <section class="modal-card-body">
          <JSONForm
            :init-schema="activeForm.questions"
            :read-only="activeForm.status === 'Submitted'"
            :init-value="userForms[activeForm._id].response"
            @cancel="activeForm = {}"
            @save="updateForm($event, 'Draft')"
            @submitted="updateForm($event, 'Submitted')"
          />
          <p v-if="formMessage" class="has-text-centered">
            <small>{{ formMessage }}</small>
          </p>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import JSONForm from "@/components/form/JSONForm.vue";

export default {
  components: {
    JSONForm
  },
  setup() {
    const forms = ref({});
    const userForms = ref({});
    const activeForm = ref({});
    const tabs = ref(["To Do", "All", "Submitted"]);
    const selectedTab = ref("To Do");
    const formMessage = ref("");

    const selectedForms = computed(() => {
      if (selectedTab.value === "All") return forms.value;

      const res = {};
      for (const [key, value] of Object.entries(forms.value)) {
        if (selectedTab.value === "To Do" && value.status !== "Submitted") {
          res[key] = value;
        } else if (
          selectedTab.value === "Submitted" &&
          value.status === "Submitted"
        ) {
          res[key] = value;
        }
      }
      return res;
    });

    const store = useStore();
    const userEmail = computed(() =>
      store.state.user.data ? store.state.user.data.email : ""
    );

    onMounted(async () => {
      forms.value = await fb.getForms();
      userForms.value = await fb.getUserForms(userEmail.value);

      for (const [key, value] of Object.entries(forms.value)) {
        let userForm = userForms.value[key];
        if (userForm) {
          value.status = userForm.status;
        } else {
          value.status = "Not Started";
          userForms.value[key] = { status: "Not Started", response: {} };
        }
      }
    });

    const updateForm = async (response, status) => {
      const success = await fb.updateUserForm(
        userEmail.value,
        activeForm.value._id,
        response,
        status
      );
      if (success) {
        formMessage.value = "Form successfully saved";
        userForms.value[activeForm.value._id] = { status, response };
        forms.value[activeForm.value._id].status = status;
        if (status === "Submitted") {
          activeForm.value = {};
        }
      } else {
        formMessage.value = "Error saving form";
      }

      // show the message only for 6 seconds
      setTimeout(() => (formMessage.value = ""), 6000);
    };

    return {
      selectedForms,
      activeForm,
      tabs,
      selectedTab,
      updateForm,
      formMessage,
      userForms
    };
  }
};
</script>

<style scoped>
.form-row {
  width: 100%;
}
</style>
