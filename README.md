# R34.GG Randomizer

A web application that randomly selects a character from popular games (League of Legends, Valorant, Overwatch) and fetches their Rule34 artwork based on user-defined filters.

## Features

- **Game Selection:** Choose between League of Legends, Valorant, or Overwatch.
- **Gender Filtering:** Filter characters by gender (Male, Female, Non-Binary, Unknown).
- **Blacklisting:** Exclude specific tags from the Rule34 search results.
- **Randomizer:** Randomly pairs an official character portrait with a Rule34 result.
- **Direct Links:** Provides a link to the original Rule34 post.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, Lucide React
- **Backend:** Node.js, Fastify, CORS
- **Deployment/Infrastructure:** Docker, Docker Compose

## Prerequisites

Before running the project, you need to have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/en/) & [npm](https://www.npmjs.com/) (if running locally without Docker)

## Installation & Setup

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd r34_gg
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Rule34 API configuration:
   ```env
   RULE34_API_KEY=your_api_key_here
   RULE34_USER_ID=your_user_id_here
   ```

3. **Build and Run:**
   Start both the frontend and backend using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Application:**
   Open your browser and navigate to: [http://localhost:3001](http://localhost:3001)

### Running Locally (Without Docker)

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Set the environment variables locally
   npm start
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   npm run preview
   # or `npm run dev` for development server
   ```

## Troubleshooting

- **No Characters Found:** The backend fetches character data on startup. If you see "Data not loaded yet" errors, check the backend logs or ensure the server has internet access to fetch from Riot/Overwatch APIs.
- **No R34 Found:** The selected character might be too obscure, or the blacklist tags might be too restrictive.
- **Proxy Issues:** If running locally via Docker, the proxy is configured to route `/api` calls from the frontend to `http://backend:3000`.

## Architecture Overview

- `backend/server.js`: Uses Fastify to serve an API endpoints that fetches and caches game character metadata from external game APIs (Riot Games, Overfast). It then randomly selects a character and hits the Rule34 API using the configured credentials.
- `frontend/src/App.jsx`: A React application that provides a sleek, dark-themed UI for users to select options, query the backend, and view the results side-by-side (Official Image vs R34 Image).
- `docker-compose.yml`: Spins up the `frontend` container (running `vite preview` on port 3001) and the `backend` container (running `node server.js` on port 3000) on the same Docker network.
