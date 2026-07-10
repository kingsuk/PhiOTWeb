#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "No .env file found. Copy .env.example first:"
  echo "  cp .env.example .env"
  exit 1
fi

# shellcheck disable=SC1091
source .env

HOST="${RUNSERVER_HOST:-127.0.0.1}"
PORT="${RUNSERVER_PORT:-5001}"

python manage.py check_env
python manage.py migrate --noinput
python manage.py runserver "${HOST}:${PORT}"
