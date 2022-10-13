FROM ubuntu:latest
WORKDIR /app
RUN apt-get update && apt-get -y install \
    nodejs
COPY commands .
COPY functions .
COPY index.js .
ENTRYPOINT node /app/index.js