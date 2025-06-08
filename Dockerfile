FROM node:22-alpine

ENV NODE_OPTIONS=--max-old-space-size=1024

WORKDIR /ITenv-Server

RUN apk add --no-cache python3 make g++  # cho ts-node nếu cần

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build  # build TS sang JS

EXPOSE 8080

CMD ["npm", "start"]
