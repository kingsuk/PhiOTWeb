from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import DeviceType, SubscriptionType


@receiver(post_migrate)
def seed_reference_data(sender, **kwargs):
    if sender.name != 'iot':
        return

    device_types = [
        (1, 'NodeMCU'),
        (2, 'ESP-01'),
    ]
    for type_id, name in device_types:
        DeviceType.objects.update_or_create(id=type_id, defaults={'name': name})

    subscription_types = [
        (1, 'Free', 0, 1, 50, 30),
        (2, 'Dev', 9, 5, 500, 30),
        (3, 'Pro', 29, 25, 5000, 365),
    ]
    for type_id, name, price, devices, api_calls, validity in subscription_types:
        SubscriptionType.objects.update_or_create(
            id=type_id,
            defaults={
                'subscription_type_name': name,
                'price': price,
                'number_of_devices': devices,
                'api_calls_per_day': api_calls,
                'validity': validity,
            },
        )
