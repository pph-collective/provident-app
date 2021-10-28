# PROVIDENT Scripts

This directory contains utility scripts for the PROVIDENT web app.

To use any of the scripts, run `yarn <script-name> <args>`.

**NOTE:** The environment variable GOOGLE_APPLICATION_CREDENTIALS must contain the path to [firebase credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk)

## `add-admin`

The `add-admin` script accepts a user's email and upgrades them to an admin user.

### Usage
```
yarn add-admin -e <email address>
```

## `add-form`

The `add-form` script takes a form specification (see the main README for details) as a json file and an id for the form, validates the keys are nominally correct, and uploads the form to firebase. If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database.  If the `--overwrite` flag is passed, the script will overwrite an existing form instead of erroring.

### Usage
```
yarn add-form --id <form id> -f <path to form> [--emulator] [--overwrite]
```

## `add-results`

The `add-results` script reads in a csv with results, and loads them to the firestore "results" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database.  If the `--emulator --seed` flags are passed, a small subset of the data used for e2e testing will be written to file so it can be copied into the seed json.

### Usage
```
yarn add-results -f <path to csv> [--emulator] [--seed]
```

## `add-svi`

The `add-svi` script reads in a csv with svi data for a single period, and loads it to the firestore "svi_data" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database. The `-p` `--period` flag must be passed with the model period for this data (e.g. `2019-2`).  The `-f` `--file` flag must be passed with the path to the csv containing the data.

### Usage
```
yarn add-svi -p 2019-2 -f <path to csv> [--emulator]
```

## `add-landmarks`

The `add-landmarks` script reads in a csv with landmark data for a single period and loads it into the firestore "landmark_data" document.

### Usage
```
yarn add-landmarks -f <path to csv> -p <period> [--emulator]
```

Flags
- `-f` `--file`: Path to the csv containing the data
- `-p` `--period`: Model period of the data (ex. "2019-1")
- `-e` `--emulator`: (optional) load the data to the emulator instead of the production database
- `-s` `--seed`: (optional) Generates a json file with a small subset of seed data instead of uploading to firebase for testing purposes

Example
```
yarn add-landmarks --emulator -f ./data/provident_landmarks_launch_edition_10_06_2021.csv -p 2019-1
```


## `shp2topo`

The `shp2topo` script downloads shp file data from the census wibsite and processes it into the format needed fot the `Map.vue` component.

### Usage
Make sure the script is updated as needed before running (e.g. correct census url).
```
yarn shp2topo
```
