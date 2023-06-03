FROM node:18
WORKDIR /src
ADD . .
RUN cd /src \
    && npm install \
    && npm install -g typescript \
    && npm run prestart \
    && rm -rf ./data/* ./plugins/*
RUN apt-get update && apt-get install nano webp ffmpeg sox opus-tools -y
ENTRYPOINT ["node", "/src/built/main.js"]
