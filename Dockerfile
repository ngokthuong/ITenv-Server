# Sử dụng Node.js 22 trên Alpine
FROM node:22-alpine

# Tăng giới hạn bộ nhớ heap để tránh crash (như lúc bạn gặp)
ENV NODE_OPTIONS=--max-old-space-size=1024

# Tạo thư mục làm việc trong container
WORKDIR /ITenv-Server

# Copy file cấu hình vào container
COPY package.json package-lock.json ./

# Cài dependencies từ npm
RUN RUN npm ci --legacy-peer-deps

# Copy toàn bộ source code vào container
COPY . .

# Mở port 8080 cho backend
EXPOSE 8080

# Chạy server bằng npm
CMD ["npm", "start"]
