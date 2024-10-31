# Use a Node.js base image
FROM node:18-alpine

# dependências para a imagem node-alpine
RUN apk add --no-cache python3 make g++ postgresql-dev

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application will listen on
EXPOSE 11100

# Define the command to run when the container starts
CMD ["npm", "start"]