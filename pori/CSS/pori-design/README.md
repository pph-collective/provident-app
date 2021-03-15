# pori

This is a not-production quality design mockup for illustrative purposes only, but it might be a helpful reference in making things moving forward. It's a vue nuxt project and it has many dependences, but it should be easy to set up if you have node and npm installed.


> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

aws s3 cp dist s3://lifespan-y2 --region us-west-1 --recursive


aws s3 cp dist s3://pori-staging --region us-east-1 --recursive