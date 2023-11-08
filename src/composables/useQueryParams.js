import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

// Converted useQueryParam.ts from the SIGNAL project.

// configInit is a list of objects listed in highest hierarchy to lowest hierarchy

// These are the types for each element in the configInit.
// interface QueryParamProps {
//   param: string;
//   ref: Ref;
//   valid: (T) => boolean;
//   push?: boolean;
//   convertInt?: boolean;
//   refField?: string;
//   /* eslint-disable @typescript-eslint/ban-types */
//   paramToVal?: Function;
//   /* eslint-disable @typescript-eslint/ban-types */
//   valToParam?: Function;
//   getInitParam: Function;
// }

// Composable to dually sync a query param's value and a ref's value
//
// Args:
//  - configInit: list of objects that contain the following
//    - param: the name of the url query param
//    - ref: the Ref var to sync with
//    - push: whether changes to the ref should trigger a push to the browser's history, or
//            just update the url in place (default: false)
//    - valid: a function to validate a param value (post parsing)
//    - convertInt: whether to parse the param as an int (default: false)
//    - refField: a sub-field of the ref to track/update
//    - paramToVal: a function to convert a post-parsing param value to the format used in
//                  the ref (optional)
//    - valToParam: a function to convert a ref's value to a param value (optional)
//    - getInitParam: a function to get the initial param to reset to
export function useQueryParams(configInit) {
  const config = [...configInit].map(
    ({
      param,
      ref,
      valid,
      push = false,
      convertInt = false,
      refField,
      paramToVal = (v) => v,
      valToParam = (v) => v,
      getInitParam,
      dependencies = [],
    }) => {
      return {
        param,
        ref,
        valid,
        push,
        convertInt,
        refField,
        paramToVal,
        valToParam,
        getInitParam,
        dependencies,
      };
    },
  );

  const route = useRoute();
  const { path } = route;
  const router = useRouter();
  const routeUpdater = router.replace; // push ? router.push : router.replace;

  // Get the current values of the refs
  const getRefValues = () => {
    return config.reduce((accumulator, { param, ref, refField }) => {
      accumulator[param] = getRefValue(ref, refField);
      return accumulator;
    }, {});
  };

  for (let {
    param,
    ref,
    valid,
    convertInt = false,
    refField,
    paramToVal,
    getInitParam,
  } of config) {
    // On initialization, check if the param already exists.  If it does, validate it, and
    // if valid, update the ref's value to match the query param.  If there is no param,
    // initialize the url to match the initial value of the ref.
    if (route.query[param]) {
      const paramVal = parseParam(route.query[param], convertInt);
      if (valid(paramVal)) {
        setRef(paramVal, ref, refField, paramToVal);
      } else {
        setRef(getInitParam(), ref, refField, paramToVal);
      }
    } else {
      setRef(getInitParam(), ref, refField, paramToVal);
    }
  }

  router.replace(getRoute(config, route, getRefValues()));

  // Watch the ref's value for changes.  When it changes, create a new route, including
  // deleting any fields that need to be reset and updating the url accordingly
  watch(getRefValues, (refValues) => {
    const newRoute = getRoute(config, route, refValues);
    routeUpdater(newRoute);
  });

  // What the url's query for changes.  If the param is unset, set it to the initial
  // value of the ref
  // If the param is set and not equal to the current val of the ref, update the ref.
  watch(
    () => route.query,
    () => {
      if (route.path === path) {
        const refValues = getRefValues();

        config.forEach(
          ({
            param,
            convertInt,
            getInitParam,
            ref,
            refField,
            paramToVal,
            valid,
          }) => {
            const paramVal = parseParam(route.query[param], convertInt);
            if (!paramVal) {
              setRef(getInitParam(), ref, refField, paramToVal);
            } else if (paramVal !== refValues[param]) {
              if (valid(paramVal)) {
                setRef(paramVal, ref, refField, paramToVal);
              } else {
                setRef(getInitParam(), ref, refField, paramToVal);
              }
            }
          },
        );
      }
    },
  );
}

const getRefValue = (ref, refField) => {
  return refField ? ref.value[refField] : ref.value;
};

const getRoute = (config, route, refValues) => {
  const query = {
    ...route.query,
  };

  for (const [param, val] of Object.entries(refValues)) {
    const { valToParam } = config.find((p) => p.param === param);
    query[param] = valToParam(val);
  }

  return {
    path: route.path,
    query,
  };
};

// parse the param as an int if needed
const parseParam = (p, convertInt) => (convertInt ? parseInt(p) : p);

// set the value of the ref to the current param's value
const setRef = (p, ref, refField, paramToVal) => {
  if (refField) {
    ref.value[refField] = paramToVal(p);
  } else {
    ref.value = paramToVal(p);
  }
};
