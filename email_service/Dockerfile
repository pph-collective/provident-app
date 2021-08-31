FROM node:16.7-buster-slim

RUN mkdir -p /app/credentials
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . ./

CMD ["node", "index.js"]
