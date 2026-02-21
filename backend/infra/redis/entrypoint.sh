#!/bin/sh
set -e

# Support Docker Secrets
if [ -f "/run/secrets/redis_password" ]; then
    PASSWORD=$(cat /run/secrets/redis_password)
else
    PASSWORD=${REDIS_PASSWORD}
fi

# Replace the password placeholder
sed "s/REPLACE_REDIS_PASSWORD/${PASSWORD}/g" /usr/local/etc/redis/redis.conf.template > /usr/local/etc/redis/redis.conf

# Start Redis with the generated config
exec redis-server /usr/local/etc/redis/redis.conf
