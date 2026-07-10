from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken

from .models import Dataset, Device, PublishLog, Subscription, SubscriptionType, User
from .serializers import (
    DatasetSerializer,
    DeviceInfoSerializer,
    DeviceSerializer,
    PublishLogSerializer,
    SubscriptionSerializer,
    SubscriptionTypeSerializer,
    result_object,
)
from .services.mqtt import MqttNotConfiguredError, publish_to_device, validate_json_message


def _get_user_id(request):
    claim = request.auth.payload.get('user_id') if request.auth else None
    if claim is not None:
        return int(claim)
    return request.user.id


def _issue_token(user):
    token = AccessToken.for_user(user)
    token['user_email'] = user.email
    token['user_id'] = str(user.id)
    return str(token)


def _today_publish_count(user):
    start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return PublishLog.objects.filter(user=user, created_date__gte=start).count()


# --- Auth ---


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_test(request):
    return Response(request.auth.payload.get('user_email', request.user.email))


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_attempt(request):
    email = request.query_params.get('email', '').strip()
    password = request.query_params.get('password', '')

    if not email or not password:
        return Response(
            result_object(0, 'Email and password are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response(
            result_object(0, 'You are not registered with us. Please register.'),
            status=status.HTTP_403_FORBIDDEN,
        )

    if not user.check_password(password):
        return Response(
            result_object(0, 'Invalid user name or password.'),
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response({'token': _issue_token(user), 'email': user.email})


@api_view(['GET'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.query_params.get('email', '').strip()
    password = request.query_params.get('password', '')

    if not email or not password:
        return Response(
            result_object(0, 'Email and password are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 6:
        return Response(
            result_object(0, 'Password must be at least 6 characters.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            result_object(0, 'A user with this email already exists.'),
            status=status.HTTP_409_CONFLICT,
        )

    User.objects.create_user(email=email, password=password)
    return Response(result_object(1, 'Registration successful.'))


# --- Device ---


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def add_new_device(request):
    device_name = request.query_params.get('DeviceName', '').strip()
    device_type_id = request.query_params.get('device_type_id')
    subscription_id = request.query_params.get('subscription_id')
    user_id = _get_user_id(request)

    if not device_name or not device_type_id or not subscription_id:
        return Response(
            result_object(0, 'All fields are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        subscription = Subscription.objects.select_related('subscription_type').get(
            id=subscription_id,
            user_id=user_id,
        )
    except Subscription.DoesNotExist:
        return Response(
            result_object(0, 'Subscription not found.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    device_count = Device.objects.filter(user_id=user_id, subscription=subscription).count()
    if device_count >= subscription.subscription_type.number_of_devices:
        return Response(
            result_object(0, 'Device limit reached for this subscription.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    token_length = settings.DEVICE_TOKEN_LENGTH
    device_token = Device.generate_token(device_name, token_length)
    while Device.objects.filter(device_token=device_token).exists():
        device_token = Device.generate_token(device_name, token_length)

    device = Device.objects.create(
        device_name=device_name,
        user_id=user_id,
        device_type_id=device_type_id,
        subscription=subscription,
        device_token=device_token,
    )

    return Response(result_object(device.id, 'Device created successfully.'))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def delete_device(request):
    device_id = request.query_params.get('id')
    user_id = _get_user_id(request)

    if not device_id:
        return Response(
            result_object(0, 'Device id is required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    deleted, _ = Device.objects.filter(id=device_id, user_id=user_id).delete()
    if not deleted:
        return Response(
            result_object(0, 'Device not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(result_object(1, 'Device deleted successfully.'))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_devices_by_user(request):
    user_id = _get_user_id(request)
    devices = Device.objects.filter(user_id=user_id).order_by('-created_date')
    return Response(DeviceSerializer(devices, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_device_info_by_device_id(request):
    device_id = request.query_params.get('deviceId')
    if not device_id:
        return Response(
            result_object(0, 'deviceId is required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        device = Device.objects.select_related(
            'subscription__subscription_type',
        ).get(id=device_id)
    except Device.DoesNotExist:
        return Response(
            result_object(0, 'Device not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    subscription = device.subscription
    days_since = (timezone.now() - subscription.modified_date).days
    if days_since > subscription.subscription_type.validity:
        return Response('Your subscription has expired!', status=status.HTTP_403_FORBIDDEN)

    log_count = _today_publish_count(device.user)
    if log_count > subscription.subscription_type.api_calls_per_day:
        return Response('Your call limit for today has finished.', status=status.HTTP_403_FORBIDDEN)

    serializer = DeviceInfoSerializer(
        device,
        context={'log_count_today': log_count},
    )
    return Response(serializer.data)


# --- Dataset ---


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_datasets(request):
    datasets = Dataset.objects.all().order_by('-created_date')
    return Response(DatasetSerializer(datasets, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_datasets_by_user_and_device(request):
    device_id = request.query_params.get('ds_deviceId')
    user_id = _get_user_id(request)

    if not device_id:
        return Response(
            result_object(0, 'ds_deviceId is required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    datasets = Dataset.objects.filter(ds_device_id=device_id, ds_user_id=user_id)
    return Response(DatasetSerializer(datasets, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def create_new_dataset(request):
    ds_name = request.query_params.get('ds_name', '').strip()
    device_id = request.query_params.get('ds_deviceId')
    json_data = request.query_params.get('jsonData', '')
    reverse_json_data = request.query_params.get('reverseJsonData', '')
    user_id = _get_user_id(request)

    if not ds_name or not device_id:
        return Response(
            result_object(0, 'Dataset name and device id are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not Device.objects.filter(id=device_id, user_id=user_id).exists():
        return Response(
            result_object(0, 'Device not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    Dataset.objects.create(
        ds_name=ds_name,
        ds_user_id=user_id,
        ds_device_id=device_id,
        json_data=json_data,
        reverse_json_data=reverse_json_data,
    )
    return Response(result_object(1, 'Dataset created successfully.'))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def edit_dataset(request):
    ds_id = request.query_params.get('ds_id')
    json_data = request.query_params.get('jsonData', '')
    reverse_json_data = request.query_params.get('reverseJsonData', '')
    user_id = _get_user_id(request)

    updated = Dataset.objects.filter(id=ds_id, ds_user_id=user_id).update(
        json_data=json_data,
        reverse_json_data=reverse_json_data,
    )
    if not updated:
        return Response(
            result_object(0, 'Dataset not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(result_object(1, 'Dataset updated successfully.'))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def delete_dataset(request):
    ds_id = request.query_params.get('ds_id')
    user_id = _get_user_id(request)

    deleted, _ = Dataset.objects.filter(id=ds_id, ds_user_id=user_id).delete()
    if not deleted:
        return Response(
            result_object(0, 'Dataset not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(result_object(1, 'Dataset deleted successfully.'))


# --- Publish ---


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_publish_log(request):
    logs = PublishLog.objects.all()
    return Response(PublishLogSerializer(logs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_publish_log_by_user_id(request):
    user_id = _get_user_id(request)
    logs = PublishLog.objects.filter(user_id=user_id)
    return Response(PublishLogSerializer(logs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_publish_log_by_user_token(request):
    token = request.query_params.get('token', '')
    user_id = _get_user_id(request)
    logs = PublishLog.objects.filter(token=token, user_id=user_id)
    return Response(PublishLogSerializer(logs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def send_to_device(request):
    token = request.query_params.get('token', '')
    message = request.query_params.get('message', '')
    user_id = _get_user_id(request)

    if not token or not message:
        return Response(
            result_object(0, 'token and message are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        device = Device.objects.select_related(
            'subscription__subscription_type',
            'user',
        ).get(device_token=token, user_id=user_id)
    except Device.DoesNotExist:
        return Response(
            result_object(0, 'Device not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    subscription = device.subscription
    days_since = (timezone.now() - subscription.modified_date).days
    if days_since > subscription.subscription_type.validity:
        return Response(
            result_object(0, 'Your subscription has expired!'),
            status=status.HTTP_403_FORBIDDEN,
        )

    log_count = _today_publish_count(device.user)
    if log_count >= subscription.subscription_type.api_calls_per_day:
        return Response(
            result_object(0, 'Your call limit for today has finished.'),
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        payload = validate_json_message(message)
        publish_to_device(token, payload)
    except MqttNotConfiguredError as exc:
        return Response(
            result_object(0, str(exc)),
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except (ValueError, RuntimeError) as exc:
        return Response(
            result_object(0, str(exc)),
            status=status.HTTP_400_BAD_REQUEST,
        )

    PublishLog.objects.create(token=token, user_id=user_id, message=payload)
    return Response(result_object(1, 'Message published successfully.'))


# --- Subscription ---


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_subscription_types(request):
    types = SubscriptionType.objects.all().order_by('id')
    return Response(SubscriptionTypeSerializer(types, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def add_new_subscription(request):
    subscription_type = request.query_params.get('subscriptionType')
    subscription_name = request.query_params.get('subscriptionName', '').strip()
    user_id = _get_user_id(request)

    if not subscription_type or not subscription_name:
        return Response(
            result_object(0, 'Subscription type and name are required.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not SubscriptionType.objects.filter(id=subscription_type).exists():
        return Response(
            result_object(0, 'Invalid subscription type.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    Subscription.objects.create(
        user_id=user_id,
        subscription_type_id=subscription_type,
        subscription_name=subscription_name,
    )
    return Response(result_object(1, 'Subscription created successfully.'))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription_by_user(request):
    user_id = _get_user_id(request)
    subscriptions = Subscription.objects.filter(user_id=user_id).order_by('-created_date')
    return Response(SubscriptionSerializer(subscriptions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def delete_subscription(request):
    subscription_id = request.query_params.get('id')
    user_id = _get_user_id(request)

    if not subscription_id:
        return Response(
            result_object(0, 'Subscription id is mandatory.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Device.objects.filter(subscription_id=subscription_id, user_id=user_id).exists():
        return Response(
            result_object(0, 'Cannot delete subscription with active devices.'),
            status=status.HTTP_400_BAD_REQUEST,
        )

    deleted, _ = Subscription.objects.filter(id=subscription_id, user_id=user_id).delete()
    if not deleted:
        return Response(
            result_object(0, 'Subscription not found.'),
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(result_object(1, 'Subscription deleted successfully.'))
