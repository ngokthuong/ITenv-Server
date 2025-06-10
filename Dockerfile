# Use node 22 on Alpine Linux
FROM node:22-alpine

# Set working directory
WORKDIR /ITenv-Server

# Copy dependencies first to leverage cache
COPY package.json yarn.lock ./

# Install dependencies including ts-node
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Expose the port your app uses
EXPOSE 8080

# Start the app with ts-node (adjust src/server.ts if needed)
CMD ["yarn", "ts-node", "src/server.ts"]
