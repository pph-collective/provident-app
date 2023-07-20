<template>
  <div class="container is-fullhd">
    <div class="p-2">
      <table class="table">
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="h-4" />
      <!--      <button @click="rerender" class="border p-2">Rerender</button>-->
    </div>

    <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
      <p class="panel-heading" data-cy="form-panel-heading">{{ title }}</p>

      <div class="p-2">
        <button
          class="button is-primary is-small"
          @click="showFilters = !showFilters"
        >
          {{ showFilters ? "Hide" : "Show" }} Filters
        </button>
      </div>

      <div
        v-if="showFilters"
        class="panel-block pt-0 is-flex-wrap-wrap is-justify-content-space-around"
      >
        <div
          v-for="(options, filterName) in filterOptions"
          :key="'filter-' + filterName"
          class="column py-0 filter-field"
        >
          <label>
            {{ filterName }}
            <Multiselect
              v-model="filters[filterName]"
              mode="tags"
              :options="options"
              :searchable="false"
              :close-on-select="true"
              :hide-selected="false"
            >
              <template #tag="{ option, handleTagRemove, disabled }">
                <div class="multiselect-tag is-flex">
                  <span class="is-flex-shrink-1 shorten-ellipsis">
                    {{ option.label }}
                  </span>
                  <span
                    v-if="!disabled"
                    class="multiselect-tag-remove"
                    @mousedown.prevent="handleTagRemove(option, $event)"
                  >
                    <span class="multiselect-tag-remove-icon"></span>
                  </span>
                </div>
              </template>
            </Multiselect>
          </label>
        </div>
      </div>
      <div v-else class="panel-block p-0" />

      <div
        v-if="filteredFormResponses.length === 0"
        data-cy="forms-panel-block"
        class="panel-block is-justify-content-center"
      >
        <span>No forms here</span>
      </div>
      <div
        v-for="(formResponse, idx) in pagedFormResponses"
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
                v-if="readOnly && formResponse.organization"
                label="ORGANIZATION"
                :value="formResponse.organization"
              />
              <PanelTag
                v-if="readOnly && formResponse.user"
                label="USER"
                :value="formResponse.user"
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
                label="last updated"
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
                @click="launchForm(formResponse, false)"
              >
                {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
              </button>
              <button
                v-else
                class="button is-primary is-light level-item"
                data-cy="review-form-button"
                type="button"
                @click="launchForm(formResponse, true)"
              >
                Review Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nav
      v-if="filteredFormResponses.length >= 0"
      class="pagination m-4"
      role="navigation"
      aria-label="pagination"
    >
      <button
        class="pagination-previous"
        :disabled="currentPage === 1"
        @click="currentPage = currentPage - 1"
      >
        Previous page
      </button>
      <button
        class="pagination-next"
        :disabled="currentPage === totalPages"
        @click="currentPage = currentPage + 1"
      >
        Next page
      </button>
      <ul class="pagination-list">
        <!-- Show the first page if the page range doesn't include the first page -->
        <li v-if="!innerPageRange.includes(1)">
          <button
            class="pagination-link"
            :disabled="currentPage === 1"
            :aria-label="`Goto page 1`"
            @click="currentPage = 1"
          >
            1
          </button>
        </li>

        <!-- Show ... between the first page and the page range -->
        <li
          v-if="
            !(innerPageRange.includes(1) || innerPageRange.includes(2)) &&
            totalPages > 2
          "
        >
          <span class="pagination-ellipsis">&hellip;</span>
        </li>

        <!-- Show the page range -->
        <li v-for="page in innerPageRange" :key="page">
          <button
            class="pagination-link"
            :disabled="currentPage === page"
            :aria-label="`Goto page ${page}`"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </li>

        <!-- Show the ... between the page range and the last page -->
        <li
          v-if="
            !(
              innerPageRange.includes(totalPages) ||
              innerPageRange.includes(totalPages - 1)
            ) && totalPages > 2
          "
        >
          <span class="pagination-ellipsis">&hellip;</span>
        </li>

        <!-- Show the last page if the page range doesn't include the last page -->
        <li>
          <button
            v-if="!innerPageRange.includes(totalPages)"
            class="pagination-link"
            :disabled="currentPage === totalPages"
            :aria-label="`Goto page ${totalPages}`"
            @click="currentPage = totalPages"
          >
            {{ totalPages }}
          </button>
        </li>
      </ul>
    </nav>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, h } from "vue";
import { useStore } from "vuex";
import Multiselect from "@vueform/multiselect";
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  createColumnHelper,
} from "@tanstack/vue-table";

import { logActivity } from "../firebase.js";
import LaunchFormResponseButton from "./LaunchFormResponseButton.vue";
import FormModal from "./form/Modal.vue";
import PanelTag from "./PanelTag.vue";
import utils, {
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
} from "../utils/utils.js";

const props = withDefaults(
  defineProps<{
    filterOptions: object;
    filterFunctions: object;
    formResponses: object[];
    title: string;
    readOnly: boolean;
  }>(),
  {
    filterOptions: () => ({}),
    filterFunctions: () => ({}),
    formResponses: () => [],
    title: "",
  }
);

type Form = {
  _id: string;
  questions: object;
  title: string;
  type: "organization" | "user";
};

type FormResponse = {
  expire_date: string;
  form: Form;
  form_assignment_id: string;
  last_updated: number;
  organization: string;
  release_date: string;
  response: {
    bg_id: string;
    municipality: string;
  };
  status: string;
  user_submitted: string;
  user_edited: string[];
};

const columnHelper = createColumnHelper<FormResponse>();

const columns = [
  columnHelper.group({
    header: "Forms",
    columns: [
      columnHelper.accessor("form.title", {
        id: "title",
        cell: (info) => info.getValue(),
        header: () => "Title",
      }),
      columnHelper.accessor("status", {
        id: "status",
        cell: (info) => info.getValue(),
        header: () => "Status",
      }),
      columnHelper.accessor("response.municipality", {
        id: "municipality",
        cell: (info) => info.getValue(),
        header: () => "Municipality",
      }),
      columnHelper.accessor("response.bg_id", {
        id: "bg_id",
        cell: (info) => info.getValue(),
        header: () => "Block Group",
      }),
      columnHelper.accessor("user_submitted", {
        id: "user_submitted",
        cell: (info) => info.getValue(),
        header: () => "Submitted By",
      }),
      columnHelper.accessor("release_date", {
        id: "release_date",
        cell: (info) => info.getValue(),
        header: () => "Release Date",
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) =>
          h(LaunchFormResponseButton, {
            formResponse: info.row.original,
            onClick: launchForm,
            userRole: userRole.value,
          }),
      }),
    ],
  }),
];

const activeFormResponse = ref({});
const activeFormReadOnly = ref(true);

const store = useStore();
const user = computed(() => store.state.user);
const userRole = computed(() =>
  user.value.data ? user.value.data.role : "user"
);

const today = utils.today();

const filters = reactive(
  Object.keys(props.filterOptions).reduce((acc, v) => {
    acc[v] = [];
    return acc;
  }, {})
);
const showFilters = ref(true);
const filteredFormResponses = computed(() => {
  let res = props.formResponses;
  for (const filterField of Object.keys(props.filterOptions)) {
    if (filters[filterField].length > 0) {
      res = res.filter((formResponse) =>
        props.filterFunctions[filterField](formResponse, filters[filterField])
      );
    }
  }
  return res;
});

const table = useVueTable({
  get data() {
    return props.formResponses;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
});

watch(filteredFormResponses, () => {
  currentPage.value = 1;
});

const pagedFormResponses = computed(() => {
  const start = maxFormResponsesPerPage * (currentPage.value - 1);
  return filteredFormResponses.value.slice(
    start,
    start + maxFormResponsesPerPage
  );
});

const currentPage = ref(1);
const maxFormResponsesPerPage = 15;

const totalPages = computed(() => {
  return Math.max(
    Math.ceil(filteredFormResponses.value.length / maxFormResponsesPerPage),
    1
  );
});

const maxVisibleInnerPages = 3;
const startPage = computed(() => {
  // First Page
  if (currentPage.value === 1) {
    return 1;
  }

  // Last Page
  if (currentPage.value === totalPages.value) {
    return Math.max(totalPages.value - maxVisibleInnerPages, 1);
  }

  // When in between
  return currentPage.value - 1;
});

const innerPageRange = computed(() => {
  const range = [];
  for (
    let i = startPage.value;
    i <= Math.min(startPage.value + maxVisibleInnerPages - 1, totalPages.value);
    i++
  ) {
    range.push(i);
  }

  return range;
});

const launchForm = (formResponse, readOnly) => {
  console.log("CLICKED");
  activeFormReadOnly.value = readOnly;
  activeFormResponse.value = formResponse;
  console.log(activeFormResponse.value);
  logActivity(
    user.value.data.email,
    readOnly ? "review form" : "launch form",
    formResponse._id
  );
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/main.scss";

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
