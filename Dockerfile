# Stage 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Ubah nginx config untuk listen di $PORT
ENV PORT=8080

RUN sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
