FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build the Vite app
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "preview"]
