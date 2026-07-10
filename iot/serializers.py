from rest_framework import serializers

from .models import Dataset, Device, PublishLog, Subscription, SubscriptionType


def result_object(status_code, status_message):
    return {'statusCode': status_code, 'statusMessage': status_message}


class DeviceSerializer(serializers.ModelSerializer):
    deviceName = serializers.CharField(source='device_name')
    createdDate = serializers.DateTimeField(source='created_date')
    modifiedDate = serializers.DateTimeField(source='modified_date')

    class Meta:
        model = Device
        fields = [
            'id',
            'deviceName',
            'user_id',
            'device_type_id',
            'status',
            'createdDate',
            'modifiedDate',
            'subscription_id',
            'device_token',
        ]


class DeviceInfoSerializer(serializers.ModelSerializer):
    deviceName = serializers.CharField(source='device_name')
    subscriptionModifiedDate = serializers.DateTimeField(source='subscription.modified_date')
    apiCallsPerDay = serializers.SerializerMethodField()
    validity = serializers.SerializerMethodField()
    logCountToday = serializers.SerializerMethodField()
    createdDate = serializers.DateTimeField(source='created_date')
    modifiedDate = serializers.DateTimeField(source='modified_date')

    class Meta:
        model = Device
        fields = [
            'id',
            'deviceName',
            'user_id',
            'device_type_id',
            'status',
            'createdDate',
            'modifiedDate',
            'subscription_id',
            'device_token',
            'subscriptionModifiedDate',
            'apiCallsPerDay',
            'validity',
            'logCountToday',
        ]

    def get_apiCallsPerDay(self, obj):
        return obj.subscription.subscription_type.api_calls_per_day

    def get_validity(self, obj):
        return obj.subscription.subscription_type.validity

    def get_logCountToday(self, obj):
        return self.context.get('log_count_today', 0)


class DatasetSerializer(serializers.ModelSerializer):
    ds_id = serializers.IntegerField(source='id')
    ds_name = serializers.CharField()
    ds_userId = serializers.IntegerField(source='ds_user_id')
    ds_deviceId = serializers.IntegerField(source='ds_device_id')
    jsonData = serializers.CharField(source='json_data')
    reverseJsonData = serializers.CharField(source='reverse_json_data')
    createdDate = serializers.DateTimeField(source='created_date')
    modifiedDate = serializers.DateTimeField(source='modified_date')

    class Meta:
        model = Dataset
        fields = [
            'ds_id',
            'ds_name',
            'ds_userId',
            'ds_deviceId',
            'jsonData',
            'reverseJsonData',
            'createdDate',
            'modifiedDate',
        ]


class SubscriptionTypeSerializer(serializers.ModelSerializer):
    subscriptionTypeName = serializers.CharField(source='subscription_type_name')
    numberOfDevices = serializers.IntegerField(source='number_of_devices')
    apiCallsPerDay = serializers.IntegerField(source='api_calls_per_day')

    class Meta:
        model = SubscriptionType
        fields = [
            'id',
            'subscriptionTypeName',
            'price',
            'numberOfDevices',
            'apiCallsPerDay',
            'validity',
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    subscriptionName = serializers.CharField(source='subscription_name')
    subscriptionType = serializers.IntegerField(source='subscription_type_id')
    userID = serializers.IntegerField(source='user_id')
    createdDate = serializers.DateTimeField(source='created_date')
    modifiedDate = serializers.DateTimeField(source='modified_date')

    class Meta:
        model = Subscription
        fields = [
            'id',
            'subscriptionType',
            'subscriptionName',
            'userID',
            'status',
            'createdDate',
            'modifiedDate',
        ]


class PublishLogSerializer(serializers.ModelSerializer):
    p_id = serializers.IntegerField(source='id')
    createdDate = serializers.DateTimeField(source='created_date')
    User_id = serializers.IntegerField(source='user_id')

    class Meta:
        model = PublishLog
        fields = ['p_id', 'createdDate', 'token', 'User_id', 'message']
