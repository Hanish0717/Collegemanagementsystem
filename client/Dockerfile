FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port
EXPOSE 5173

# Vite requires '--host' parameter to expose the dev server outside the container
CMD ["npm", "run", "dev", "--", "--host"]
