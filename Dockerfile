# Use the Nginx image from Docker Hub
FROM nginx:latest

# Copy the static website files into the Nginx container
COPY . /usr/share/nginx/html

# Copy the entrypoint script into the container
COPY entrypoint.sh /entrypoint.sh

# Make the script executable
RUN chmod +x /entrypoint.sh

# Use the script as the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
