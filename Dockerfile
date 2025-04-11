# Sử dụng Node.js 22 trên Alpine Linux (nhẹ)
FROM node:22-alpine 

# Đặt thư mục làm việc trong container
WORKDIR /ITenv-Server 

# Sao chép package.json và yarn.lock vào container
COPY package.json yarn.lock ./  

# Cài đặt dependencies, dùng chính xác phiên bản
RUN yarn install --frozen-lockfile  

# Sao chép toàn bộ mã nguồn vào container
COPY . .  

# Mở cổng (ex: 8080)
EXPOSE 8080  

# Lệnh chạy ứng dụng
CMD ["yarn", "start"]
