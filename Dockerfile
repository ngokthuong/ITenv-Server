# Use node 22 on Alpine Linux
FROM node:22-alpine 

# Place folder in container 
WORKDIR /ITenv-Server 

# copy package.json and yarn.lock.json to container
COPY package.json yarn.lock ./  

# install dependencies
RUN yarn install --frozen-lockfile  

# Copy source to container
COPY . .  

# Build TypeScript code
RUN yarn build  

# (ex: 8080)
EXPOSE 8080  

# Start server
CMD ["yarn", "start"]
