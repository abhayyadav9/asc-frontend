# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .
# Debugging step: Print HomePage.tsx content to verify changes are picked up
RUN cat client/src/pages/HomePage.tsx

# Build the React app for production
RUN CI=true npm run build

# Expose the port the app runs on (Vite default is 5173 for dev, but build output is served differently)
# For serving static files from 'dist', we'll use a simple HTTP server
EXPOSE 3000

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Command to serve the static files from the 'dist' directory
CMD ["serve", "-s", "dist", "-l", "3000"] 