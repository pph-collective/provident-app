# PROVIDENT Email Service

As part of the provident web app, we need to send semi-realtime email notifications to admins and users to alert them to forms/requests that require their attention.  This script (index.js) is run in a cron job on the BKE cluster every 15 minutes.  It finds the email requests in the database that haven't been sent and have a `sendTime` before now, then sends those emails via the Brown mail relay.

## Getting Started

Install the dependencies
```
yarn
```

Place the json file with the google service account credentials (same as is needed in the root of this github repo) in the `credentials` folder.
```
cp ../serviceAccount.json credentials/serviceAccount.json
```

To run against emulator data:
```
node index.js --emulator
```

To run with a test email server (will generate preview links instead of sending and not mark the emails as sent):
```
node index.js --test
```

To send the real live, non-test emails:
```
node index.js
```

## Deployment

A docker container on the BKE cluster is run every 15 minutes.  The container is from github container register (ghcr.io) and is automatically built by GitHub actions when changes to this directory are pushed to `main`.

See [brown-ccv/k8s-bke-deploy](https://github.com/brown-ccv/k8s-deploy-bke) for instructions on how to connect to the cluster.  The namespace for this project is `pphc-provident`.

The `cronjob.yml` file specifies where to pull the docker container from, how frequently to run the job, and where on the cluster to run it (prod internal).  To deploy any changes to this file, connect to the cluster, then run:
```
kubectl apply -k .
```
