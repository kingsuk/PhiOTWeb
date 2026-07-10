import json

from django.conf import settings
from django.utils import timezone

from iot.models import Dataset, Device, PublishLog, Subscription, SubscriptionType, User
from iot.services.mqtt import MqttNotConfiguredError, publish_to_device, validate_json_message

SUBSCRIPTION_TYPE_NAMES = {1: 'Free', 2: 'Dev', 3: 'Pro'}


def subscription_type_name(type_id):
    return SUBSCRIPTION_TYPE_NAMES.get(type_id, 'Unknown')


def register_user(email, password):
    if User.objects.filter(email__iexact=email).exists():
        return False, 'A user with this email already exists.'
    User.objects.create_user(email=email, password=password)
    return True, 'Registration successful.'


def create_subscription(user, subscription_type_id, subscription_name):
    if not SubscriptionType.objects.filter(id=subscription_type_id).exists():
        return False, 'Invalid subscription type.'
    Subscription.objects.create(
        user=user,
        subscription_type_id=subscription_type_id,
        subscription_name=subscription_name,
    )
    return True, 'Subscription created successfully.'


def delete_subscription(user, subscription_id):
    if Device.objects.filter(subscription_id=subscription_id, user=user).exists():
        return False, 'Cannot delete subscription with active devices.'
    deleted, _ = Subscription.objects.filter(id=subscription_id, user=user).delete()
    if not deleted:
        return False, 'Subscription not found.'
    return True, 'Subscription deleted successfully.'


def create_device(user, device_name, device_type_id, subscription_id):
    try:
        subscription = Subscription.objects.select_related('subscription_type').get(
            id=subscription_id,
            user=user,
        )
    except Subscription.DoesNotExist:
        return None, 'Subscription not found.'

    device_count = Device.objects.filter(user=user, subscription=subscription).count()
    if device_count >= subscription.subscription_type.number_of_devices:
        return None, 'Device limit reached for this subscription.'

    token_length = settings.DEVICE_TOKEN_LENGTH
    device_token = Device.generate_token(device_name, token_length)
    while Device.objects.filter(device_token=device_token).exists():
        device_token = Device.generate_token(device_name, token_length)

    device = Device.objects.create(
        device_name=device_name,
        user=user,
        device_type_id=device_type_id,
        subscription=subscription,
        device_token=device_token,
    )
    return device, 'Device created successfully.'


def delete_device(user, device_id):
    deleted, _ = Device.objects.filter(id=device_id, user=user).delete()
    if not deleted:
        return False, 'Device not found.'
    return True, 'Device deleted successfully.'


def today_publish_count(user):
    start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return PublishLog.objects.filter(user=user, created_date__gte=start).count()


def get_device_with_limits(device_id):
    try:
        device = Device.objects.select_related(
            'subscription__subscription_type',
            'user',
        ).get(id=device_id)
    except Device.DoesNotExist:
        return None, 'Device not found.'

    subscription = device.subscription
    days_since = (timezone.now() - subscription.modified_date).days
    if days_since > subscription.subscription_type.validity:
        return None, 'Your subscription has expired!'

    log_count = today_publish_count(device.user)
    if log_count > subscription.subscription_type.api_calls_per_day:
        return None, 'Your call limit for today has finished.'

    return device, None


def publish_message(user, device_token, message):
    try:
        device = Device.objects.select_related(
            'subscription__subscription_type',
            'user',
        ).get(device_token=device_token, user=user)
    except Device.DoesNotExist:
        return False, 'Device not found.'

    subscription = device.subscription
    days_since = (timezone.now() - subscription.modified_date).days
    if days_since > subscription.subscription_type.validity:
        return False, 'Your subscription has expired!'

    log_count = today_publish_count(device.user)
    if log_count >= subscription.subscription_type.api_calls_per_day:
        return False, 'Your call limit for today has finished.'

    try:
        payload = validate_json_message(message)
        publish_to_device(device_token, payload)
    except MqttNotConfiguredError as exc:
        return False, str(exc)
    except (ValueError, RuntimeError) as exc:
        return False, str(exc)

    PublishLog.objects.create(token=device_token, user=user, message=payload)
    return True, 'Message published successfully.'


def build_dataset_payload(changed_pins):
    return json.dumps([{'header': 'data', 'data': changed_pins}])


def reverse_pin_values(pins):
    reversed_pins = []
    for pin in pins:
        reversed_pins.append({
            'name': pin['name'],
            'pin': pin.get('pin'),
            'value': 1 if pin['value'] == 0 else 0,
        })
    return reversed_pins
