# Stage 1: Build the Vite app
FROM node:22.12.0 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
COPY cert/ /cert/

# Build the React app
RUN npm run build

# Stage 2: Serve the app with a Node.js server (instead of Nginx)
FROM node:22.12.0

WORKDIR /app

# Copy the build output
COPY --from=build /app/dist /app/dist

# Install dependencies for the production server
COPY package.json package-lock.json ./
RUN npm install --only=production

# Install serve for serving the static files
RUN npm install -g serve

# Expose the required port
EXPOSE 8080

# Command to run your server
CMD ["serve", "-s", "dist", "-l", "8080"]
