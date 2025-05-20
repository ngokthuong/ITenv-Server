# Use Node.js 20 LTS on Alpine Linux (more stable)
FROM node:20-alpine

# Install necessary dependencies and system libraries
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    build-base \
    krb5 \
    krb5-dev \
    openssl \
    openssl-dev \
    libffi \
    libffi-dev \
    zlib \
    zlib-dev

# Set working directory
WORKDIR /ITenv-Server

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies and rebuild bcrypt
RUN yarn install --frozen-lockfile && \
    cd node_modules/bcrypt && \
    npm rebuild bcrypt --build-from-source && \
    cd ../..

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["yarn", "start"]
