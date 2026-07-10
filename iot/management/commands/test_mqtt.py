import json

from django.conf import settings
from django.core.management.base import BaseCommand

from iot.services.mqtt import MqttNotConfiguredError, publish_to_device


class Command(BaseCommand):
    help = 'Test MQTT broker connectivity using settings from .env'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Only verify configuration without publishing a message',
        )

    def handle(self, *args, **options):
        if not settings.MQTT_BROKER_HOST:
            self.stderr.write(self.style.ERROR(
                'MQTT_BROKER_HOST is not set. Add your broker details to .env'
            ))
            raise SystemExit(1)

        self.stdout.write(f'Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}')
        self.stdout.write(f'Topic prefix: {settings.MQTT_PUBLISH_TOPIC_PREFIX}')
        self.stdout.write(f'TLS: {settings.MQTT_USE_TLS}')

        if options['dry_run']:
            self.stdout.write(self.style.SUCCESS('MQTT configuration looks valid.'))
            return

        test_token = '__phiotweb_test__'
        payload = json.dumps([{'header': 'ping', 'source': 'phiotweb'}])

        try:
            publish_to_device(test_token, payload)
        except MqttNotConfiguredError as exc:
            self.stderr.write(self.style.ERROR(str(exc)))
            raise SystemExit(1)
        except RuntimeError as exc:
            self.stderr.write(self.style.ERROR(str(exc)))
            raise SystemExit(1)

        self.stdout.write(self.style.SUCCESS(
            f'Published test message to {settings.MQTT_PUBLISH_TOPIC_PREFIX}{test_token}'
        ))
