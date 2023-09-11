import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

/**
 * Composable to dually sync a query param's value and a ref's value
 * @param {string} param the name of the url query param
 * @param {Ref} ref the Ref var to sync with
 * @param {boolean} push if true changes push entries onto browser history (default false)
 * @param {Function} valid function to validate param value (post parse)
 * @param {boolean} convertInt should parse param as number (default false)
 * @param {string} refField a sub-field of the ref to track/update
 * @param {Function} paramToVal function to convert param => ref (optional)
 * @param {Function} valToParam function to convert ref => param (optional)
 * @param {string[]} refFields other param values to reset when this param changes (optional)
 */
export function useQueryParam({
  param,
  ref,
  valid,
  push = false,
  convertInt = false,
  refField,
  paramToVal = (v) => v,
  valToParam = (v) => v,
  resetFields = [],
}) {
  const route = useRoute();
  const { path } = route;
  const router = useRouter();
  const routeUpdater = push ? router.push : router.replace;

  // get the current value of the ref
  const getRefValue = () => (refField ? ref.value[refField] : ref.value);

  // store the initial value of the ref so we can reset to it
  const initVal = getRefValue();

  // parse the param as an int if needed
  const parseParam = (p) => (convertInt ? parseInt(p) : p);

  // set the value of the ref to the current param's value
  const setRef = (p) => {
    if (refField) {
      ref.value[refField] = paramToVal(p);
    } else {
      ref.value = paramToVal(p);
    }
  };

  // build the new route object given a value
  const getRoute = (val) => ({
    path,
    query: { ...route.query, [param]: valToParam(val) },
  });

  // On initialization, check if the param already exists.  If it does, validate it, and
  // if valid, update the ref's value to match the query param.  If there is no param,
  // initialize the url to match the initial value of the ref.
  if (route.query[param]) {
    const paramVal = parseParam(route.query[param]);
    if (!valid(paramVal)) {
      throw new Error(`Invalid URL query parameter: ${param} = ${paramVal}`);
    }
    setRef(paramVal);
  } else {
    router.replace(getRoute(getRefValue()));
  }

  // Watch the ref's value for changes.  When it changes, create a new route, including
  // deleting any fields that need to be reset and updating the url accordingly
  watch(getRefValue, (val) => {
    const newRoute = getRoute(val);
    resetFields.forEach((field) => {
      delete newRoute.query[field]; // this feels wrong...
    });
    routeUpdater(newRoute);
  });

  // What the url's query for changes.  If the param is unset, set it to the initial
  // value of the ref (this is how resetFields ultimately actually resets the field).
  // If the param is set and not equal to the current val of the ref, update the ref.
  watch(
    () => route.query,
    () => {
      if (route.path === path) {
        const paramVal = parseParam(route.query[param]);
        if (!paramVal) {
          router.replace(getRoute(initVal));
        } else if (paramVal !== getRefValue()) {
          setRef(paramVal);
        }
      }
    }
  );
}
