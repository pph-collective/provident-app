# PROVIDENT Scripts

This directory contains utility scripts for the PROVIDENT web app.

To use any of the scripts, run `yarn <script-name> <args>`.

**NOTE:** The environment variable GOOGLE_APPLICATION_CREDENTIALS must contain the path to [firebase credentials](https://firebase.google.com/docs/admin/setup#initialize-sdk)

## Adding in a new dataset
1. Determine your model period, ex. `2024-1`
2. Adding in all the new data. *Note:* There is the `copy` script if you want to copy over the same data such as for the landmarks data.
  - `add-results` for the predictions
  - `add-svi` for the svi data
  - `add-landmarks` for the landmark data
  - `add-tooltip` for the tooltip data
3. Afterwards make the data live!
  - In the firebase console go to `model_data > periods`
  - Add in a `map` which is an object and add in two `string` fields like the following:
    ```
    {
      "version": "2024-1",
      "description": "description for 2024-1"
    }
    ```

## All the Scripts

### `add-results`

The `add-results` script reads in a csv with predicted blockgroups, and loads them to the firestore "model_predictions" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database.  If the `--emulator --seed` flags are passed, a small subset of the data used for e2e testing will be written to file so it can be copied into the seed json.

#### Usage
```shell
node ./scripts/add-results.js -f <path to csv> -p <period> [--emulator] [--seed]
```

### `add-model-towns`

The `add-model-towns` script reads in a csv with town metadata, and loads them to the firestore "model_data" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database.  If the `--emulator --seed` flags are passed, a small subset of the data used for e2e testing will be written to file so it can be copied into the seed json.

#### Usage
```shell
node ./scripts/add-model-towns.js  [--emulator] [--seed]
```

### `add-svi`

The `add-svi` script reads in a csv with svi data for a single period, and loads it to the firestore "svi_data" document.  If the `--emulator` flag is passed, the data will be loaded to the emulator instead of the production database. The `-p` `--period` flag must be passed with the model period for this data (e.g. `2019-2`).  The `-f` `--file` flag must be passed with the path to the csv containing the data.

#### Usage
```
node ./scripts/add-svi.js -p <period> -c <path to cbg file> -t <path to town file> -r <path to ri file> [--emulator] [--seed]
```
Flags
- `-e`, `--emulator`: use emulator
- `-p`, `--period`: which model period should this data be attached to (e.g. '2019-2')
- `-c`, `--cbgfile`: path to cbg file
- `-t`, `--townfile`: path to town file
- `-r`, `--rifile`: path to ri file
- `-s`, `--seed`: Generate a json file with seed data instead of uploading to firebase


### `add-landmarks`

The `add-landmarks` script reads in a csv with landmark data for a single period and loads it into the firestore "landmark_data" document.

#### Usage
```shell
node ./scripts/add-landmarks.js -f <path to csv> -p <period> [--emulator]
```

Flags
- `-f` `--file`: Path to the csv containing the data
- `-p` `--period`: Model period of the data (ex. "2019-1")
- `-e` `--emulator`: (optional) load the data to the emulator instead of the production database
- `-s` `--seed`: (optional) Generates a json file with a small subset of seed data instead of uploading to firebase for testing purposes

Example
```shell
node ./scripts/add-landmarks.js --emulator -f ./data/provident_landmarks_launch_edition_10_06_2021.csv -p 2019-1
```

### `add-tooltip`

The `add-tooltip` script reads in a csv with tooltip data regarding whether the block group has been previously predicted.

#### Usage

```shell
node ./scripts/add-tooltip.js -f <path to csv> -p <period> [--emulator]
```

Example
```shell
node ./scripts/add-tooltip.js --emulator -f ./data/cbg_predictions_tooltip_2023-1.csv -p 2023-1
```

### `shp2topo`

The `shp2topo` script downloads shp file data from the census website and processes it into the format needed fot the `Map.vue` component.

#### Usage
Make sure the script is updated as needed before running (e.g. correct census url).
```
yarn shp2topo
```

### `copy`

The `copy` script copies a document in one collection to another document in the same collection.

#### Usage

```shell
node ./scripts/copy.js --emulator --collection <collection name> --from <from document name> --to <to document name>
```
