from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Validate environment configuration from .env'

    def handle(self, *args, **options):
        issues = []
        warnings = []

        if settings.SECRET_KEY.startswith('django-insecure') or settings.SECRET_KEY == 'change-me-to-a-long-random-secret-key':
            if settings.DEBUG:
                warnings.append('SECRET_KEY is using a default value (fine for local dev).')
            else:
                issues.append('SECRET_KEY must be set to a unique value in production.')

        if not settings.DEBUG and not settings.ALLOWED_HOSTS:
            issues.append('ALLOWED_HOSTS must be set when DEBUG=False.')

        if not settings.DEBUG and not settings.CSRF_TRUSTED_ORIGINS:
            warnings.append('CSRF_TRUSTED_ORIGINS is empty — required for HTTPS forms in production.')

        if not settings.MQTT_BROKER_HOST:
            warnings.append('MQTT_BROKER_HOST is not set — device publishing is disabled.')
        else:
            self.stdout.write(self.style.SUCCESS(f'MQTT broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}'))
            if settings.MQTT_USE_TLS:
                self.stdout.write('MQTT TLS: enabled')
            if settings.MQTT_USERNAME:
                self.stdout.write('MQTT auth: configured')

        self.stdout.write(self.style.SUCCESS(f'Database: {settings.DATABASES["default"]["NAME"]}'))
        self.stdout.write(self.style.SUCCESS(f'Debug mode: {settings.DEBUG}'))

        for message in warnings:
            self.stdout.write(self.style.WARNING(f'Warning: {message}'))

        for message in issues:
            self.stderr.write(self.style.ERROR(f'Error: {message}'))

        if issues:
            self.stderr.write(self.style.ERROR('Environment check failed.'))
            raise SystemExit(1)

        self.stdout.write(self.style.SUCCESS('Environment check passed.'))
