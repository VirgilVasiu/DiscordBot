FROM node:lts
RUN mkdir -p /app
WORKDIR /app
COPY commands .
COPY functions .
COPY package.json .
COPY debuffList.json .
COPY config.json .
COPY index.js .
RUN npm install
ENTRYPOINT node /app/index.js