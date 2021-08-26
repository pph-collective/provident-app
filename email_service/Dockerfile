FROM node:16.7-buster-slim

ARG TEMP_GAC=/app/credentials/serviceAccount.json
ENV GOOGLE_APPLICATION_CREDENTIALS=$TEMP_GAC

RUN mkdir -p /app/credentials
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . ./

CMD ["node", "index.js"]
