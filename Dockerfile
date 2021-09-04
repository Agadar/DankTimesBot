FROM node:14.17.6
WORKDIR /src
ADD . .
RUN cd /src \
    && npm install \
    && npm install -g typescript \
    && npm run prestart \
    && rm -rf ./src ./data/* ./plugins/*

ENTRYPOINT ["node", "/src/built/main.js"]
