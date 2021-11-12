FROM node:16-bullseye-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY index.js .

RUN yarn install --frozen-lockfile

CMD ["node", "index.js"]
