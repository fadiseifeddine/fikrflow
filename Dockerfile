# Use the Nginx image from Docker Hub
FROM nginx:latest

# Copy the static website files into the Nginx container
COPY . /usr/share/nginx/html

# Expose port 5500
EXPOSE 8080