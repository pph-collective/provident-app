# pro-found-vident-base

A base web application for the PROVIDENT project.

## Project setup
```
yarn
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
* `type`: The type of the form which can be either `user` or `organization`
* `questions`: An object specifying the fields and logic (all below sections refer to questions)

A sample JSON:
```json
{
  "title": "My Form",
  "type": "user",
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
* `Checkbox`: A list of checkboxes to check
* `Date`: A calendar date picker
* `LikertScale`: A table of radio buttons to rate statements
* `Radio`: Radio button group
* `Select`: Drop down menu
* `SubForm`: A component that acts as a form. Typically used to repeat a group of questions.
* `TextArea`: A multi-line text input
* `TextInput`: A one line text input

Required keys for all fields:
* `model`: The identifier for the question result (e.g. `"age"`)
* `component`: Which field to use (e.g. `TextInput`)
* `label`: The question to display with the input (e.g. `"How old are you?"`)

Optional keys supported on all fields:
* `required`: A boolean (true/false) indicating if the field is required
* `help_text` : A string containing help text displayed for the user to see.
* `validations`: A string containing a [yup](https://github.com/jquense/yup#api) validation method (e.g. `"yup.number().positive().required()"`)
* `condition`: A string containing a function which takes the model as an argument and returns true if the question should be shown or false if not (e.g. `"(model) => model.past_question === 'Yes'"`)

#### Checkbox

Required additional keys:

- `options`: an array of strings which the user can select.

#### Date

Optional keys:

- `max_date`: a date formatted as `"yyyy-mm-dd"`. Disables dates on the date picker after this date.
- `min_date`: `"today"` or a date formatted as `"yyyy-mm-dd"`. Disables dates on the date picker before this date.

If `min` is set to `today` then, whenever the form is viewed any date before today is disabled.

#### `LikertScale`

Required additional keys:

- `statements`: a list of strings to rate. For example,
```
statements: [
    "It is easy to get sterile needles in this census tract",
    "It is easy to get new works (like cookers, cottons, sterile water) in this census tract",
    "It is easy to get naloxone in this census tract"
]
```

Optional keys:

`options`: a list of strings on a rating scale and defaults to the following.
```
options: [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
    "N/A"
]
```

#### Radio

Required additional keys:

`options`: an array of strings which the user can select

#### Select

Required additional keys:

- `options`: an array of strings which the user can select.

#### SubForm

Required additional keys:
- `questions`: an array of the question dictionaries

Optional keys: 
- `repeat_button_title`: a string. If supplied, a button to repeat this sub form will appear at the bottom. For example `"+ Task"`

:warning: The `validations` key doesn't work as expected in the SubForm component because it looks at the whole form globally instead of scoped to just the sub form.

#### TextArea

The `TextArea` field only uses the standard keys.

#### TextInput

Optional keys:
- `type`: Different input types. The default is `"text"`. Other values include can be found [on the MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types)

Not all of these will work out of the box, common ones that will are:
* `text`
* `color`
* `date` (we have a more specific date field as well)
* `email`
* `month`
* `number`
* `password` (though probably not a good reason to use this in a form...)
* `tel`
* `time`
* `url`
* `week`

## Authentication

This web app uses firebase auth to restrict access to the `snacks` and `admin` paths.

To create a user, navigate to `/login`, then select the `Request Account` button and fill out the form.  An admin can then approve that request.  (This can also be done manually in the database by marking the user as `status: "approved"`).

To make a user an admin, see the [add-admin script](scripts/README.md).  (The key differentiating feature of an admin vs normal user is that their JWT includes an `admin: true` claim).

## Testing
This web app uses the Cypress testing framework alongside a locally run Firestore emulator. It uses`cypress-firebase`, `firebase-admin`, and `@firebase/rules-unit-testing` packages to connect Cypress to Firebase and it includes additional methods and commands for admins and testing purposes interacting with Firestore.

### Setup

In order for `firebase-admin` to have read/write access during testing, we need to include a private key.

1. Navigate to the Firebase console to generate a private key (Settings > Service Accounts).
2. Click **Generate New Private Key** and save the JSON file as `serviceAccount.json`
3. Add that JSON file to the project root directory. This file is listed in the `.gitignore`. Do not share this private key.

### Running the tests

In separate terminals, run `yarn firebase:dev`, `yarn serve`, and then `yarn test:e2e`.

### Notes

In order for Cypress to access admin firebase commands in test specs, use/create custom Cypress tasks in `./tests/e2e/plugins/index.js` or use the custom Cypress commands included in [cypress-firebase](https://github.com/prescottprue/cypress-firebase).

## Email

The admin email is set in the `.env.production` file, if you would like to override this in development create a file with the same keys called `.env.local` and set the email to the value you'd like.  See `email_service/` for more details on sending emails.

## Firestore rules
In development, you can use the `firestore.rules` file to test edits to the firestore rules against the firebase emulator. Afterwards, you'll want to make your changes live in the production firebase project, `provident-ri`.

## Activity Logging

Various actions are logged as a user interacts with the app:

* `login`: the user logs in, no `subAction`
* `click map`: the user selects a block group on the map, `subAction` is the selected geoid
* `zoom map`: the user zooms in on a block group on the map, `subAction` is the selected geoid
* `launch form`: the user launches a form on the forms page, `subAction` is the form id
* `create NRA`: the user selects the create button on the neighborhood rapid assessment widget, `subAction` is the selected geoid
* `launch NRA form`: the user launches a form on the NRA widget, `subAction` is the form id

## Querying the Data

See [`query_examples/`](query_examples) for more on how to get data out of firebase.
