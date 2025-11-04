# Build stage only - output will be copied by backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# The dist folder will be copied by the backend Dockerfile
