# PROVIDENT Scripts

This directory contains utility scripts for the PROVIDENT web app.

To use any of the scripts, run `yarn <script-name> <args>`.

**NOTE:** The environment variable GOOGLE_APPLICATION_CREDENTIALS must contain the path to [firebase credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk)

## `add-admin`

The `add-admin` script accepts a user's email and upgrades them to an admin user.

### Usage
```
yarn add-admin <email address>
```

## `add-form`

The `add-form` script takes a form specification (see the main README for details) as a json file and an id for the form, validates the keys are nominally correct, and uploads the form to firebase.

### Usage
```
yarn add-form <form id> <path to form>
```

## `add-results`

The `add-results` script reads in a csv with results, and loads them to the firestore "results" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database.  If the `--emulator --seed` flags are passed, a small subset of the data used for e2e testing will be written to file so it can be copied into the seed json.

### Usage
```
yarn add-results <path to csv> [--emulator]
```

## `shp2topo`

The `shp2topo` script downloads shp file data from the census wibsite and processes it into the format needed fot the `Map.vue` component.

### Usage
Make sure the script is updated as needed before running (e.g. correct census url).
```
yarn shp2topo
```
