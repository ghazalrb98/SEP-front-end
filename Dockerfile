FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build
FROM node:18-alpine AS production
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
USER node
CMD ["serve", "-s", "build", "-l", "3000"]
