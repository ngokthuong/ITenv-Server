# 1. Dùng image có Node + tools
FROM node:22-alpine

# 2. Set working directory
WORKDIR /ITenv-Server

# 3. Copy package files
COPY package.json yarn.lock ./

# 4. Cài dependencies
RUN yarn install

# 5. Copy toàn bộ project vào container
COPY . .

# 6. Tăng heap size cho Node.js khi chạy ts-node
ENV NODE_OPTIONS=--max-old-space-size=2048

# 7. Expose cổng chạy server (ví dụ: 8080)
EXPOSE 8080

# 8. Run trực tiếp bằng ts-node
CMD ["yarn", "start"]
