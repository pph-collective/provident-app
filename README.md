# pro-found-vident-base

A base web application for the PROVIDENT project.

## Project setup
```
yarn install
yarn firebase login
```

### Compiles and hot-reloads for development
```
yarn firebase:dev # local firebase data
yarn serve # in separate terminal
```

### Save updated firebase data
```
yarn firebase:savedev
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Run your end-to-end tests
```
yarn test:e2e
```

### Lints and fixes files
```
yarn lint
```

## Forms

As part of this web app, forms can be specified using JSON and added to the firebase store. There is support for a variety of field types, validation, and conditional fields.

The form has the following keys at the root level:

* `title`: The title of the form (will display to the end user)
* `release_date`: The date the form will become available to end users
* `questions`: An object specifying the fields and logic (all below sections refer to questions)

A sample JSON:
```json
{
  "title": "My Form",
  "release_date": "2021-05-21",
  "questions": [
    {
      "model": "age",
      "component": "TextInput",
      "type": "number",
      "label": "What is your age?",
      "validations": "yup.number().min(13).max(110).required()",
      "required": true
    },
    {
      "model": "old",
      "component": "Radio",
      "label": "Do you feel old?",
      "condition": "(model) => model.age > 100",
      "options": [
        "Yes",
        "No",
        "Get off my lawn"
      ]
    },
    {
      "model": "favorite_color",
      "component": "Select",
      "label": "What is your favorite color?",
      "required": true,
      "options": [
        "Green",
        "Rainbow",
        "Sparkles",
        "Other"
      ]
    },
    {
      "model": "other_favorite_color",
      "component": "TextInput",
      "label": "Favorite Color",
      "required": true,
      "condition": "(model) => model.favorite_color === 'Other'"
    },
    {
      "model": "color_essay",
      "component": "TextArea",
      "label": "Please write an essay about your favorite color."
    }
  ]
}
```

We're using [formvuelate](https://formvuelate.js.org/guide/#installation) to build and validate our forms.  The validation is done using [VeeValidate](https://formvuelate.js.org/guide/veevalidate.html) and [yup](https://github.com/jquense/yup#api).

See [scripts](scripts/README.md) for info on how to upload a JSON form to firebase

### Field Types

The fields currently supported (component in `src/components/forms`) are:
* `TextInput`: A one line text input
* `TextArea`: A multi-line text input
* `Radio`: Radio button group
* `Select`: Drop down menu

All of these fields require the following keys:
* `model`: The identifier for the question result (e.g. `"age"`)
* `component`: Which field to use (e.g. `TextInput`)
* `label`: The question to display with the input (e.g. `"How old are you?"`)

All of these fields support the following keys:
* `required`: A boolean (true/false) indicating if the field is required
* `validations`: A string containing a [yup](https://github.com/jquense/yup#api) validation method (e.g. `"yup.number().positive().required()"`)
* `condition`: A string containing a function which takes the model as an argument and returns true if the question should be shown or false if not (e.g. `"(model) => model.past_question === 'Yes'"`)

#### `TextInput`

The `TextInput` field also accepts the `type` key.  The default is `text`.  Other values include can be found [on the MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)

Not all of these will work out of the box, common ones that will are:
* `text`
* `color`
* `date`
* `email`
* `month`
* `number`
* `password` (though probably not a good reason to use this in a form...)
* `tel`
* `time`
* `url`
* `week`

#### `TextArea`

The `TextArea` field only uses the standard keys.

#### `Radio`

The `Radio` field requires the `options` key, which is an array of strings which the user can select.

#### `Select`

The `Select` field requires the `options` key, which is an array of strings which the user can select.

## Authentication

This web app uses firebase auth to restrict access to the `snacks` and `admin` paths.

To create a user, navigate to `/login`, then select the `Request Account` button and fill out the form.  An admin can then approve that request.  (This can also be done manually in the database by marking the user as `status: "approved"`).

To make a user an admin, see the [add-admin script](scripts/README.md).  (The key differentiating feature of an admin vs normal user is that their JWT includes an `admin: true` claim).

## Testing
This web app uses the Cypress testing framework alongside a locally run Firestore emulator. It uses`cypress-firebase`, `firebase-admin`, and `@firebase/rules-unit-testing` packages to connect Cypress to Firebase and it includes additional methods and commands for admins and testing purposes interacting with Firestore.

**Setup**

In order for `firebase-admin` to have read/write access during testing, we need to include a private key.

1. Navigate to the Firebase console to generate a private key (Settings > Service Accounts).
1. Click **Generate New Private Key** and save the JSON file as `serviceAccount.json`
1. Add that JSON file to the project root directory. This file is listed in the `.gitignore`. Do not share this private key.

**Notes**

In order for Cypress to access admin firebase commands in test specs, use/create custom Cypress tasks in `./tests/e2e/plugins/index.js` or use the custom Cypress commands included in [cypress-firebase](https://github.com/prescottprue/cypress-firebase).