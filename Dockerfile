FROM node:16

WORKDIR /src
ADD . .
RUN cd /src && npm install && npm install -g typescript && npm run prestart

ENTRYPOINT ["node", "/src/built/main.js"]
