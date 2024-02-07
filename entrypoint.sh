#!/bin/sh

# Replace the port number in the Nginx configuration with the one from the PORT environment variable
sed -i "s/listen.*;/listen $PORT;/g" /etc/nginx/conf.d/default.conf

# Start Nginx in the foreground
nginx -g 'daemon off;'
