# PROVIDENT

A base web application for the PROVIDENT project.

## Project setup
```
yarn
yarn firebase login
```

### Compiles and hot-reloads for development

> [!NOTE]  
> Only need to start the server now. The emulator for Firebase (backend database) and authentication have been disabled.

```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

## Authentication

> [!NOTE]
> Authentication has been removed for the public-facing version of PROVIDENT

## Testing

> [!NOTE]
> Testing has been removed for the public-facing version of PROVIDENT. Tests were previously mainly used to test 
> permissions and database changes.

### Setup Firebase Admin

> [!NOTE]
> This is necessary if you want to run any of the scripts. Mainly setting up Firebase Admin allows you to read/write to 
> to the database 

In order for `firebase-admin` to have read/write access, we need to include a private key.

1. Navigate to the Firebase console to generate a private key (Settings > Service Accounts).
2. Click **Generate New Private Key** and save the JSON file as `serviceAccount.json`
3. Add that JSON file to the project root directory. This file is listed in the `.gitignore`. Do not share this private key.

## Firestore Security Rules
> [!WARNING]
> Firebase Security Rules are live on the Firebase Console.

The `firestore.rules` file (in the repo) was used to test edits to the firestore rules against the firebase emulator. We no longer use the firebase emulator.

## Activity Logging

> [!NOTE]  
> Activity logging is to be migrated over to using only Google Analytics [#338](https://github.com/pph-collective/provident-app/issues/338)

## Querying the Data

> [!WARNING]
> Querying the data scripts have been removed from this repository. 
