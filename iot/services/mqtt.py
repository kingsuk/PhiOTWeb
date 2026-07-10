import json
import logging
import time

import paho.mqtt.client as mqtt
from django.conf import settings

logger = logging.getLogger(__name__)


class MqttNotConfiguredError(Exception):
    pass


def publish_to_device(device_token: str, message: str) -> None:
    """Publish a JSON payload to the configured MQTT broker."""
    host = settings.MQTT_BROKER_HOST
    if not host:
        raise MqttNotConfiguredError(
            'MQTT broker is not configured. Set MQTT_BROKER_HOST in your .env file.'
        )

    port = settings.MQTT_BROKER_PORT
    topic = f'{settings.MQTT_PUBLISH_TOPIC_PREFIX}{device_token}'

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    if settings.MQTT_USERNAME:
        client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD or None)

    if settings.MQTT_USE_TLS:
        client.tls_set()

    try:
        client.connect(host, port, keepalive=60)
        client.publish(topic, message, qos=0)
        client.disconnect()
        logger.info('Published to MQTT topic %s', topic)
    except Exception as exc:
        logger.exception('MQTT publish failed for topic %s', topic)
        raise RuntimeError(f'MQTT publish failed: {exc}') from exc


def check_broker_connection(timeout: float = 3.0) -> tuple[bool, str]:
    """Attempt a short-lived connection to the configured MQTT broker."""
    host = settings.MQTT_BROKER_HOST
    if not host:
        return False, 'MQTT broker is not configured.'

    port = settings.MQTT_BROKER_PORT
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    if settings.MQTT_USERNAME:
        client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD or None)
    if settings.MQTT_USE_TLS:
        client.tls_set()

    try:
        client.connect(host, port, keepalive=30)
        client.loop_start()
        deadline = time.time() + timeout
        while time.time() < deadline:
            if client.is_connected():
                client.loop_stop()
                client.disconnect()
                return True, f'Connected to {host}:{port}'
            time.sleep(0.1)
        client.loop_stop()
        client.disconnect()
        return False, f'Could not confirm connection to {host}:{port}'
    except Exception as exc:
        logger.exception('MQTT connection check failed')
        return False, f'Connection failed: {exc}'


def validate_json_message(message: str) -> str:
    """Ensure message is valid JSON text before publishing."""
    try:
        parsed = json.loads(message)
    except json.JSONDecodeError as exc:
        raise ValueError('Message must be valid JSON') from exc
    return json.dumps(parsed)
