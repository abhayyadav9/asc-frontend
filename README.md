# Courses API - Frontend (React + TypeScript)

This is the frontend for the Courses API application, built with React, TypeScript, Vite, and Material UI.

## Features

- Modern web interface to interact with the Courses API.
- Create, view, list, and delete courses.
- Create, view, list, and delete course instances for specific year/semesters.
- Clean, responsive design using Material UI.
- Dockerized for easy setup and deployment.

## Running Locally with Docker

This frontend service is designed to be run as part of the `docker-compose.yml` setup in the project root.

1.  **Ensure Docker and Docker Compose are installed.**
2.  **Navigate to the project root directory** (where `docker-compose.yml` is located).
3.  **Build and run the services:**
    ```bash
    docker-compose up --build
    ```
    The frontend will be built into static assets and served by a simple HTTP server (see `client/Dockerfile`).

4.  **Accessing the Application:**
    The frontend will be available at `http://localhost:5173`.

## Running Locally for Development (without Docker for frontend)

If you want to run the frontend with Vite's hot-reloading development server (while the backend runs in Docker):

1.  **Ensure the backend is running via Docker Compose:**
    In the project root, run `docker-compose up backend db` (or `docker-compose up` and ignore the frontend output from compose).
    The backend API should be available at `http://localhost:8000/api`.

2.  **Set up API Base URL for local dev:**
    The frontend needs to know where the API is. The `client/src/services/api.ts` file defaults to `http://localhost:8000/api` if `VITE_API_BASE_URL` is not set. You can create a `.env` file in the `client` directory (`client/.env`) with the following content:
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    ```
    This ensures the dev server proxies requests correctly or makes calls to the right URL.

3.  **Navigate to the `client` directory:**
    ```bash
    cd client
    ```

4.  **Install dependencies (if not already done):**
    ```bash
    npm install
    ```

5.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy) with hot reloading.

## Design & Architecture Justification

- **React & TypeScript:** Chosen for building a modern, type-safe, and scalable user interface. React's component-based architecture promotes reusability and maintainability. TypeScript adds static typing for improved code quality and developer experience.
- **Vite:** A fast and modern build tool for frontend development, offering quick startup times and Hot Module Replacement (HMR).
- **Material UI:** A popular React UI library providing pre-built components that follow Material Design principles, allowing for a clean and professional look with less custom styling.
- **React Router DOM:** For client-side routing, enabling a single-page application (SPA) experience.
- **Axios:** For making HTTP requests to the backend API.
- **Component-Based Structure:**
    - `pages/`: Top-level components representing different views/pages of the application.
    - `components/`: Reusable UI components (e.g., `NavBar`).
    - `services/`: Modules for interacting with the backend API (e.g., `api.ts`).
    - `types/`: TypeScript type definitions for data structures (e.g., `Course`, `Instance`).
- **Environment Variables:** `VITE_API_BASE_URL` is used to configure the backend API endpoint, allowing flexibility for different environments (Docker vs. local dev).
#   a s c - f r o n t e n d  
 