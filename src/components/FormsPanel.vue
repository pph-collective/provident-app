<template>
  <div class="container">
    <section class="section">
      <h1 class="title">Forms</h1>
      <!-- Display mobile controls card only on mobile devices -->
      <div class="display-only-mobile card my-2">
        <header class="card-header">
          <div class="card-header-title">Filters</div>
          <button
            class="card-header-icon"
            aria-label="more options"
            @click="() => (displayMobileFilters = !displayMobileFilters)"
          >
            <span class="icon">
              <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </header>
        <div v-if="displayMobileFilters" class="card-content">
          <div
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <div
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="is-flex is-flex-direction-column is-align-content-stretch"
            >
              <button
                v-if="header.column.getCanFilter()"
                class="button my-2"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />

                {{
                  header.column.getCanSort()
                    ? { asc: " ▲", desc: " ▼", false: " ▶" }[
                        header.column.getIsSorted() as string
                      ]
                    : ""
                }}
              </button>
              <div v-if="header.column.getCanFilter()" style="width: 100%">
                <ColumnFiltering
                  :column="header.column"
                  :table="table"
                  style="width: 100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="b-table table-container">
        <div class="table-wrapper has-mobile-cards">
          <table class="table is-striped">
            <thead>
              <tr
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
              >
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :colSpan="header.colSpan"
                  :class="header.column.getCanSort() ? 'is-clickable' : ''"
                >
                  <div
                    @click="header.column.getToggleSortingHandler()?.($event)"
                  >
                    <FlexRender
                      v-if="!header.isPlaceholder"
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />

                    {{
                      header.column.getCanSort()
                        ? { asc: " ▲", desc: " ▼", false: "▶" }[
                            header.column.getIsSorted() as string
                          ]
                        : ""
                    }}
                  </div>
                  <div v-if="header.column.getCanFilter()">
                    <ColumnFiltering :column="header.column" :table="table" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody data-cy="forms-table-body">
              <tr v-for="row in table.getRowModel().rows" :key="row.id">
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :data-label="
                    cell.column.columnDef.header &&
                    cell.column.columnDef.header() // TODO: There's type error here but i dont know why...
                  "
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div>
            <button
              class="button border rounded p-3 m-1"
              :disabled="!table.getCanPreviousPage()"
              @click="() => table.setPageIndex(0)"
            >
              First
            </button>
            <button
              class="button border rounded p-3 m-1"
              :disabled="!table.getCanPreviousPage()"
              @click="() => table.previousPage()"
            >
              Prev
            </button>
            <button
              class="button border rounded p-3 m-1"
              :disabled="!table.getCanNextPage()"
              @click="() => table.nextPage()"
            >
              Next
            </button>
            <button
              class="button border rounded p-3 m-1"
              :disabled="!table.getCanNextPage()"
              @click="() => table.setPageIndex(table.getPageCount() - 1)"
            >
              Last
            </button>
          </div>
          <span>
            <strong>
              {{ table.getState().pagination.pageIndex + 1 }} of
              {{ table.getPageCount() }}
            </strong>
          </span>
          <span>
            | Go to page:
            <input
              type="number"
              :value="goToPageNumber"
              class="border p-1 rounded w-16"
              @change="handleGoToPage"
            />
          </span>
          <select
            :value="table.getState().pagination.pageSize"
            @change="handlePageSizeChange"
          >
            <option
              v-for="pageSize in pageSizes"
              :key="pageSize"
              :value="pageSize"
            >
              Show {{ pageSize }}
            </option>
          </select>
        </div>
      </div>
    </section>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useStore } from "vuex";
import {
  FlexRender,
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useVueTable,
} from "@tanstack/vue-table";

import { logActivity } from "../firebase.js";
import ColumnFiltering from "./ColumnFiltering.vue";
import LaunchFormResponseButton from "./LaunchFormResponseButton.vue";
import FormModal from "./form/Modal.vue";

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
  users_edited: string[];
};

const store = useStore();
const user = computed(() => store.state.user);
const userRole = computed(() =>
  user.value.data ? user.value.data.role : "user"
);

const columnHelper = createColumnHelper<FormResponse>();

const columns = [
  columnHelper.group({
    id: "forms",
    columns: [
      columnHelper.accessor("form.title", {
        id: "title",
        cell: (info) => info.getValue(),
        header: () => "Title",
      }),
      columnHelper.accessor("status", {
        id: "status",
        cell: (info) =>
          h(
            "span",
            {
              class: {
                "tag is-light": true,
                "is-success": info.getValue() === "Submitted",
                "is-warning": info.getValue() === "Not Started",
              },
            },
            [info.getValue()]
          ),
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
      columnHelper.accessor("organization", {
        id: "organization",
        cell: (info) => info.getValue(),
        header: () => "Organization",
      }),
      columnHelper.accessor("user_submitted", {
        id: "user_submitted",
        cell: (info) => info.getValue(),
        header: () => "Submitted By",
      }),
      columnHelper.accessor("last_updated", {
        id: "last_updated",
        size: 90,
        minSize: 90,
        cell: (info) => new Date(info.getValue()).toISOString().slice(0, 10),
        header: () => "Last Updated",
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) =>
          h(LaunchFormResponseButton, {
            formResponse: info.row.original,
            onClick: launchForm,
            userRole: userRole.value,
            readOnly: props.readOnly,
          }),
        header: () => "",
      }),
    ],
  }),
];

const sorting = ref<SortingState>([
  {
    id: "last_updated",
    desc: true,
  },
]);
const columnFilters = ref<ColumnFiltersState>([]);

const INITIAL_PAGE_INDEX = 0;
const goToPageNumber = ref(INITIAL_PAGE_INDEX + 1);
const pageSizes = [10, 20, 30, 40, 50];

const activeFormResponse = ref({});
const activeFormReadOnly = ref(true);
const displayMobileFilters = ref(false);

const table = useVueTable({
  get data() {
    return props.formResponses;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
  },
  initialState: {
    pagination: {
      pageSize: 20,
    },
  },

  // // TODO: Just copying the sorting format hoping it is fine
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnFilters.value)
        : updaterOrValue;
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting.value)
        : updaterOrValue;
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

console.log(table.getHeaderGroups());

const launchForm = (formResponse: { _id?: any }, readOnly: boolean) => {
  activeFormReadOnly.value = readOnly;
  activeFormResponse.value = formResponse;
  logActivity(
    user.value.data.email,
    readOnly ? "review form" : "launch form",
    formResponse._id
  );
};

function handleGoToPage(e) {
  const page = e.target.value ? Number(e.target.value) - 1 : 0;
  goToPageNumber.value = page + 1;
  table.setPageIndex(page);
}

function handlePageSizeChange(e) {
  table.setPageSize(Number(e.target.value));
}
</script>

<style lang="scss" scoped>
@import "../assets/styles/main.scss";

.table {
  overflow-x: auto;
}

.display-only-mobile {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
