<template>
  <div class="panel is-primary m-4">
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
          <p class="level-item">
            {{ form.status }}
          </p>
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
            class="button is-light level-item"
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
            :schema="activeForm.questions"
            :read-only="activeForm.status === 'Submitted'"
            @cancel="activeForm = {}"
            @save="saveForm($event)"
            @submitted="submitForm($event)"
          />
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
    const user = computed(() => store.state.user);

    onMounted(async () => {
      forms.value = await fb.getForms();
      userForms.value = await fb.getUserForms(user.value.data.email);

      for (const [key, value] of Object.entries(forms.value)) {
        let userForm = userForms.value[key];
        if (userForm) {
          value.status = userForm.status;
        } else {
          value.status = "Not Started";
        }
      }
      console.log(forms.value);
      console.log(userForms.value);
    });

    const saveForm = formValues => {
      console.log(`saving form!`);
      console.log(formValues);
    };

    const submitForm = formValues => {
      console.log("submitting form!");
      console.log(formValues);
      activeForm.value = {};
    };

    return {
      selectedForms,
      activeForm,
      tabs,
      selectedTab,
      saveForm,
      submitForm
    };
  }
};
</script>

<style scoped>
.form-row {
  width: 100%;
}
</style>
