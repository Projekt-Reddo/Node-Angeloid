# Base Image
FROM node:15
# Default work directory
WORKDIR /app
# Copy package.jon to /app
COPY package.json .

# Install dependencies
ARG NODE_ENV
RUN npm install

# Copy all files in the projekt to /app
COPY . .
# ENV
ENV PORT=9000
# Port
EXPOSE 9000
# Run dev
CMD ["node", "index.js"]