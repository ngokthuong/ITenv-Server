# 1. Dùng image có Node + tools
FROM node:22-alpine

# 2. Set working directory
WORKDIR /ITenv-Server

# 3. Copy package files trước để tối ưu cache
COPY package.json yarn.lock ./

# 4. Cài dependencies
RUN yarn install --frozen-lockfile  

# ✅ 5. Copy toàn bộ mã nguồn vào container (TRƯỚC khi build)
COPY . .

# ✅ 6. Build project
RUN yarn build

# 7. Tăng heap size cho Node.js khi chạy ts-node
ENV NODE_OPTIONS=--max-old-space-size=2048

# 8. Expose cổng chạy server (ví dụ: 8080)
EXPOSE 8080

# 9. Run server
CMD ["yarn", "start"]
