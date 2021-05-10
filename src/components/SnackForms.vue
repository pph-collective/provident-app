<template>
  <div class="container is-fluid">
    I am forms!
    <div v-for="(form, i) in forms" :key="'form-' + i">
      {{ form }}
      <JSONForm :schema="form.questions" />
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";

import fb from "@/firebase";
import JSONForm from "@/components/form/JSONForm.vue";

export default {
  components: {
    JSONForm
  },
  setup() {
    const forms = ref([]);

    onMounted(async () => {
      forms.value = await fb.getForms();
      console.log(forms.value);
    });

    return {
      forms
    };
  }
};
</script>
