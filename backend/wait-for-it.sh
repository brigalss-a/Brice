#!/bin/sh
# wait-for-it.sh: Wait until a host:port are available, then exec the given command.
# Usage: ./wait-for-it.sh host:port -- command args
# See: https://github.com/vishnubob/wait-for-it

hostport="$1"
shift

host="${hostport%%:*}"
port="${hostport##*:}"

while ! nc -z "$host" "$port"; do
  echo "Waiting for $host:$port..."
  sleep 1
done

echo "$host:$port is available. Starting command: $@"
exec "$@"
