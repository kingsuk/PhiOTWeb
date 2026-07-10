# PhiOTWeb (Django)

IoT device management platform rebuilt on **Django 6** with **SQLite**, replacing the legacy ASP.NET Core + SQL Server stack.

## Features

- User registration and JWT authentication
- Subscription plans (Free, Dev, Pro)
- Device management (NodeMCU, ESP-01)
- GPIO dataset storage
- MQTT command publishing (configure broker via environment variables)
- Compatible API routes for the existing Angular frontend

## Requirements

- Python 3.10+
- Node.js (only if rebuilding the Angular frontend)

## Quick Start

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY and MQTT broker settings when ready

# 3. Run database migrations
python manage.py migrate

# 4. Start the development server
python manage.py runserver 5001
```

Open http://localhost:5001

## Database

The app uses **SQLite** (`db.sqlite3` in the project root). Migrations create all tables automatically. Reference data (device types, subscription tiers) is seeded on first migration.

To reset the database:

```bash
rm db.sqlite3
python manage.py migrate
```

## MQTT Configuration

MQTT settings are read from environment variables (or `.env`). Provide your broker details when ready:

| Variable | Description |
|----------|-------------|
| `MQTT_BROKER_HOST` | Broker hostname (required to publish) |
| `MQTT_BROKER_PORT` | Port (default: 1883) |
| `MQTT_USERNAME` | Optional username |
| `MQTT_PASSWORD` | Optional password |
| `MQTT_PUBLISH_TOPIC_PREFIX` | Topic prefix (default: `inTopic/`) |
| `MQTT_USE_TLS` | `True` to enable TLS |

Publishing returns HTTP 503 until `MQTT_BROKER_HOST` is configured.

## API

All endpoints are under `/api/` and mirror the original ASP.NET routes, for example:

- `GET /api/auth/Register?email=...&password=...`
- `GET /api/auth/AuthAttempt?email=...&password=...`
- `GET /api/device/GetAllDevicesByUser` (Bearer token required)
- `GET /api/publish/sendToDevice?token=...&message=...` (Bearer token required)

Django admin: http://localhost:5001/admin/

## Angular Frontend

The original Angular 4 UI lives in `ClientApp/`. To rebuild static assets:

```bash
npm install
node node_modules/webpack/bin/webpack.js --config webpack.config.vendor.js
node node_modules/webpack/bin/webpack.js
```

Built files go to `wwwroot/dist/` and are served by Django.

## Project Structure

```
config/          Django settings and root URLs
iot/             Main app (models, views, migrations)
templates/       SPA shell template
ClientApp/       Angular frontend source (legacy)
manage.py        Django management script
requirements.txt Python dependencies
```

## Legacy ASP.NET Code

The original C# controllers and SQL Server configuration remain in the repository for reference but are no longer the active backend. Use `python manage.py runserver` instead of `dotnet run`.
