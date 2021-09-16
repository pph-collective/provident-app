<template>
  <Loading :loading="organizations.length === 0" />
  <div class="container">
    <section class="section">
      <h1 class="title">Organization Management</h1>
      <div class="content">
        <button class="button is-primary">+ Create</button>
      </div>

      <table class="table" data-cy="organization-table">
        <thead>
          <tr>
            <th v-for="field in fields" class="is-clickable" :key="field">
              <span class="icon-text">
                <span>{{ field }}</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="org in organizations" :key="org.name">
            <td>{{ org.name }}</td>
            <td>{{ org.intervention_arm }}</td>
            <td>{{ org.municipalities }}</td>
          </tr>
          <tr v-if="organizations.length === 0">
            <td :colspan="fields.length">
              <div class="is-flex is-justify-content-center">
                <p>No organizations found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

import Loading from "@/components/Loading.vue";

export default {
  components: {
    Loading,
  },
  setup() {
    const store = useStore();
    const organizations = computed(() => store.state.organizations);
    const fields = ["Name", "Intervention Arm", "Municipalities"];

    return {
      fields,
      organizations,
    };
  },
};
</script>
