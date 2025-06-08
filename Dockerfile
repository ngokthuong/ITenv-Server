FROM node:22-alpine

ENV NODE_OPTIONS=--max-old-space-size=1024

WORKDIR /ITenv-Server

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
