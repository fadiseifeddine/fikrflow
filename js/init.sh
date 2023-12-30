#!/bin/sh
# init.sh
if [ ! -f /usr/share/nginx/html/index.html ]; then
    cp /path/to/backup/index.html /usr/share/nginx/html/
fi