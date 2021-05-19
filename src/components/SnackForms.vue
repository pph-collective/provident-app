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
      v-if="selectedForms.length === 0"
      class="panel-block is-justify-content-center"
    >
      <span>No forms here</span>
    </div>
    <div
      v-else
      v-for="(form, idx) in selectedForms"
      :key="'form-' + idx"
      class="panel-block"
    >
      <div class="level form-row">
        <div class="level-left">
          <p class="level-item is-size-5">
            {{ form.title }}
          </p>
        </div>

        <div class="level-right">
          <span v-if="user.admin" class="level-item tag">
            <p><strong>RELEASE DATE:</strong> {{ form.release_date }}</p>
          </span>
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
    const forms = ref([]);
    const userForms = ref({});
    const activeForm = ref({});
    const tabs = ref(["To Do", "All", "Submitted"]);
    const selectedTab = ref("To Do");
    const formMessage = ref("");

    const selectedForms = computed(() => {
      if (selectedTab.value === "All") return forms.value;

      return forms.value.filter(value => {
        if (selectedTab.value === "To Do" && value.status !== "Submitted") {
          return true;
        } else if (
          selectedTab.value === "Submitted" &&
          value.status === "Submitted"
        ) {
          return true;
        }

        return false;
      });
    });

    const store = useStore();
    const user = computed(() => store.state.user);
    const userEmail = computed(() =>
      user.value.data ? user.value.data.email : ""
    );

    onMounted(async () => {
      forms.value = await fb.getForms();
      console.log(forms.value);
      if (!user.value.admin) {
        let tz = Date.now().getTimezoneOffset() / 60;
        forms.value = forms.value.filter(f => {
          let releaseDate = new Date(`${f.release_date}Z${tz}`);
          return releaseDate <= Date.now();
        });
      }
      userForms.value = await fb.getUserForms(userEmail.value);

      forms.value.forEach(value => {
        let userForm = userForms.value[value._id];
        if (userForm) {
          value.status = userForm.status;
        } else {
          value.status = "Not Started";
          userForms.value[value._id] = { status: "Not Started", response: {} };
        }
      });
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
        forms.value.find(f => f._id === activeForm.value._id).status = status;
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
      userForms,
      user
    };
  }
};
</script>

<style scoped>
.form-row {
  width: 100%;
}
</style>
