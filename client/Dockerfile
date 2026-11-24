FROM node:20.11-alpine as base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source
COPY . .

FROM base as dev

EXPOSE 3000

CMD ["npm", "start"]