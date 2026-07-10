# PhiOTWeb (Django)

IoT device management platform built with **Django 6** and **SQLite**.

## Features

- Server-rendered Django templates (no separate frontend framework)
- User registration and session authentication
- Subscription plans (Free, Dev, Pro)
- Device management (NodeMCU, ESP-01)
- GPIO pin control UI with saved datasets
- MQTT command publishing via environment variables

## Requirements

- Python 3.10+

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 5001
```

Open http://localhost:5001

## Database

SQLite (`db.sqlite3`) with Django migrations. Reference data (device types, subscription tiers) is seeded on migrate.

```bash
rm db.sqlite3 && python manage.py migrate
```

## Environment variables

Copy the example file and edit your values:

```bash
cp .env.example .env
```

All configuration lives in `.env`. See `.env.example` for every available variable:

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret key (required in production) |
| `DEBUG` | Debug mode (`True` / `False`) |
| `ALLOWED_HOSTS` | Comma-separated hostnames |
| `CSRF_TRUSTED_ORIGINS` | HTTPS origins for CSRF |
| `DATABASE_PATH` | SQLite file path |
| `DEVICE_TOKEN_LENGTH` | Length of device MQTT tokens |
| `MQTT_BROKER_HOST` | MQTT broker hostname |
| `MQTT_BROKER_PORT` | MQTT broker port |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | Broker credentials |
| `MQTT_PUBLISH_TOPIC_PREFIX` | Outbound topic prefix |
| `MQTT_USE_TLS` | Enable TLS (`True` / `False`) |

## MQTT Configuration

Set in `.env` when your broker is ready:

```env
MQTT_BROKER_HOST=your-broker.example.com
MQTT_BROKER_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_PUBLISH_TOPIC_PREFIX=inTopic/
```

## Project Structure

```
config/       Django settings and URLs
iot/          Models, views, templates integration
templates/    Django HTML templates
static/       CSS and JavaScript
manage.py
```

## Testing

```bash
python manage.py check
python manage.py test iot
```

Create a superuser for Django admin:

```bash
python manage.py createsuperuser
```
