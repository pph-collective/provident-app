<template>
  <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
    <p class="panel-heading" data-cy="form-panel-heading">
      I am forms!
    </p>

    <div class="panel-tabs" data-cy="panel-tabs">
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
      data-cy="forms-panel-block"
      class="panel-block is-justify-content-center"
    >
      <span>No forms here</span>
    </div>
    <div
      v-else
      data-cy="forms-panel-block"
      v-for="(form, idx) in selectedForms"
      :key="'form-' + idx"
      class="panel-block"
    >
      <div class="level form-row" data-cy="form-row">
        <div class="level-left">
          <p class="level-item is-size-5" data-cy="form-title">
            {{ form.title }}
          </p>
        </div>

        <div class="level-right has-text-centered">
          <span
            v-if="user.admin"
            class="level-item tag"
            :class="{
              'is-success is-light': form.release_date <= today
            }"
            data-cy="release-date-tag"
          >
            <p><strong>RELEASE DATE:</strong> {{ form.release_date }}</p>
          </span>
          <span
            class="level-item tag is-light"
            :class="{
              'is-warning': form.status === 'Not Started',
              'is-info': form.status === 'Draft',
              'is-success': form.status === 'Submitted'
            }"
            data-cy="status-tag"
          >
            <p><strong>STATUS:</strong> {{ form.status }}</p>
          </span>
          <div class="level-item">
            <button
              v-if="form.status !== 'Submitted'"
              class="button is-primary level-item"
              data-cy="launch-form-button"
              type="button"
              @click="activeForm = form"
            >
              Launch Form
            </button>
            <button
              v-else
              class="button is-primary is-light level-item"
              data-cy="review-form-button"
              type="button"
              @click="activeForm = form"
            >
              Review Form
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div
      v-if="activeForm.questions"
      class="modal is-active"
      data-cy="active-form-modal"
    >
      <div class="modal-background" @click="activeForm = {}"></div>
      <div class="modal-content is-family-secondary">
        <header class="modal-card-head">
          <p class="modal-card-title" data-cy="active-form-title">
            {{ activeForm.title }}
          </p>
          <button
            class="delete"
            data-cy="close-form"
            aria-label="close"
            @click="activeForm = {}"
          ></button>
        </header>
        <section class="modal-card-body" data-cy="form-body">
          <JSONForm
            :init-schema="activeForm.questions"
            :read-only="activeForm.status === 'Submitted'"
            :init-value="userForms[activeForm._id].response"
            @save="updateForm($event, 'Draft')"
            @submitted="updateForm($event, 'Submitted')"
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

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    onMounted(async () => {
      forms.value = await fb.getForms();
      if (!user.value.admin) {
        forms.value = forms.value.filter(f => {
          return f.release_date <= today;
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
      today,
      userForms,
      user
    };
  }
};
</script>

<style lang="scss" scoped>
@import "bulma";

.form-row {
  width: 100%;
}

.modal-card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 40px);
}

@include mobile {
  .modal-content {
    height: 100vh;
    max-height: 100vh;
  }

  .modal-card-head {
    height: 65px;
  }

  .modal-card-body {
    /* 65 px is the height of the header */
    height: calc(100vh - 65px);
  }

  /* Reduce the padding when on mobile */
  .modal-card-body {
    padding: 10px;
  }

  .modal .container {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
