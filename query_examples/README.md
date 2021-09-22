# Query Examples

How do I get this data out of firebase anyway??

## Some notes to get started

1. To query the data from firebase, you must be added as a user on the project. Reach out
   to a project admin to get added or request data.

2. We have a quota on the number of data reads/writes we can do per day, so please query data then write to file so you can reuse that data for your analysis.

3. Your queries are auditable :ghost:

4. You'll need a key!

  In order for `firebase-admin` to have read/write access during testing, we need to include a private key.

  1. Navigate to the Firebase console to generate a private key (Settings > Service Accounts).
  2. Click **Generate New Private Key** and save the JSON file as `serviceAccount.json`
  3. Add that JSON file to the project root directory. This file is listed in the `.gitignore`. Do not share this private key.

4. Don't commit data you save back to the repo, save it somewhere else please!

5. These example scripts are meant to be just that, examples. Feel free to extend them and take inspiration from them or add to the collection!

6. The firebase docs are thorough (though a little sprawling) [this is a good starting place](https://firebase.google.com/docs/firestore/query-data/get-data). Note - we are using firebase web version 8 when looking at their examples.
