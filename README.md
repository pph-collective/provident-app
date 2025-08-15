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

## API Key Setup

### Setting up the Environment Variable

Copy the `.env.example` file to create your own environment file:
```bash
  cp .env.example .env.local
```

>[!IMPORTANT]
> Use `.env.local` (not `.env`) - this file is gitignored and won't be committed
> Environment variables in Vite must be prefixed with `VITE_` to be accessible in the browser
> Never commit your actual API keys to version control

### MapBox

This project uses MapBox for map rendering. To get the map working properly, you'll need to set up an API key.

Open `.env.local` and add your actual API key:
```
  VITE_MAPBOX_API_KEY=your_actual_api_key_here
```

### Setup Firebase Admin

> [!NOTE]
> This is necessary if you want to run any of the scripts. Mainly setting up Firebase Admin allows you to read/write 
> to the database 

In order for `firebase-admin` to have read/write access, we need to include a private key.

1. Navigate to the Firebase console to generate a private key (Settings > Service Accounts).
2. Click **Generate New Private Key** and save the JSON file as `serviceAccount.json`
3. Add that JSON file to the project root directory. This file is listed in the `.gitignore`. Do not share this private key.

## Firestore Security Rules
The `firestore.rules` file (in the repo) was used to test edits to the firestore rules against the firebase emulator. We no longer use the firebase emulator. Firebase Security Rules are editted and displayed live in the Firebase Console.

## Activity Logging

> [!NOTE]  
> Activity logging is to be migrated over to using only Google Analytics [#338](https://github.com/pph-collective/provident-app/issues/338)

