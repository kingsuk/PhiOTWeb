import uuid

import bcrypt
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    status = models.IntegerField(default=1)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def set_password(self, raw_password):
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        self.password = hashed.decode('utf-8')

    def check_password(self, raw_password):
        try:
            return bcrypt.checkpw(
                raw_password.encode('utf-8'),
                self.password.encode('utf-8'),
            )
        except (ValueError, TypeError):
            return False

    def __str__(self):
        return self.email


class DeviceType(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'device_types'

    def __str__(self):
        return self.name


class SubscriptionType(models.Model):
    subscription_type_name = models.CharField(max_length=100)
    price = models.IntegerField(default=0)
    number_of_devices = models.IntegerField(default=1)
    api_calls_per_day = models.BigIntegerField(default=100)
    validity = models.IntegerField(default=30, help_text='Validity in days')

    class Meta:
        db_table = 'subscription_types'

    def __str__(self):
        return self.subscription_type_name


class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    subscription_type = models.ForeignKey(
        SubscriptionType,
        on_delete=models.PROTECT,
        related_name='subscriptions',
    )
    subscription_name = models.CharField(max_length=200)
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'

    def __str__(self):
        return self.subscription_name


class Device(models.Model):
    device_name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    device_type = models.ForeignKey(DeviceType, on_delete=models.PROTECT, related_name='devices')
    subscription = models.ForeignKey(Subscription, on_delete=models.PROTECT, related_name='devices')
    device_token = models.CharField(max_length=50, unique=True)
    status = models.IntegerField(default=1)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'devices'

    def __str__(self):
        return self.device_name

    @staticmethod
    def generate_token(device_name, length=15):
        base = device_name.replace(' ', '')
        suffix = uuid.uuid4().hex
        return (base + suffix)[:length]


class Dataset(models.Model):
    ds_name = models.CharField(max_length=200)
    ds_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    ds_device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='datasets')
    json_data = models.TextField()
    reverse_json_data = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'datasets'

    def __str__(self):
        return self.ds_name


class PublishLog(models.Model):
    token = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='publish_logs')
    message = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'publish_logs'
        ordering = ['-created_date']

    def __str__(self):
        return f'{self.token} @ {self.created_date}'
