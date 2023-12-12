# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /Users/arizona/Desktop/Work/ArizonaLabs/csv-xp

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose the application port (if applicable)
EXPOSE 3000

# Define the command to run your application
CMD [ "nodemon", "server/server.js" ]