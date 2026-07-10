from django.contrib import admin

from .models import Dataset, Device, DeviceType, PublishLog, Subscription, SubscriptionType, User

admin.site.register(User)
admin.site.register(DeviceType)
admin.site.register(SubscriptionType)
admin.site.register(Subscription)
admin.site.register(Device)
admin.site.register(Dataset)
admin.site.register(PublishLog)
