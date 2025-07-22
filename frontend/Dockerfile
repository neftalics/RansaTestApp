FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json angular.json tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build -- --output-path=dist

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
