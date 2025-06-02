#!/bin/bash
# wait-for-mongo.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Waiting for MongoDB at $host:$port..."

until mongosh --host "$host:$port" --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "MongoDB is unavailable - sleeping for 2 seconds"
  sleep 2
done

echo "MongoDB is up - executing command"
exec $cmd 