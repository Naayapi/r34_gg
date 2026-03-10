FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build the Vite app
RUN npm run build

# Install serve to run the build output
RUN npm install -g serve
EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
