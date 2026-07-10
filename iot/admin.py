from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Dataset, Device, DeviceType, PublishLog, Subscription, SubscriptionType, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ('email', 'is_staff', 'is_active', 'created_date')
    search_fields = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('last_login', 'created_date', 'modified_date')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
    readonly_fields = ('created_date', 'modified_date', 'last_login')


admin.site.register(DeviceType)
admin.site.register(SubscriptionType)
admin.site.register(Subscription)
admin.site.register(Device)
admin.site.register(Dataset)
admin.site.register(PublishLog)
