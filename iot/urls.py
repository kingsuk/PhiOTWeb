from django.urls import path

from . import views

urlpatterns = [
    # Auth — matches original casing used by Angular
    path('auth/test', views.auth_test),
    path('auth/AuthAttempt', views.auth_attempt),
    path('auth/Register', views.register_user),

    # Device
    path('Device/AddNewDevice', views.add_new_device),
    path('device/AddNewDevice', views.add_new_device),
    path('device/DeleteDeviceByDeviceAndUserId', views.delete_device),
    path('device/GetAllDevicesByUser', views.get_all_devices_by_user),
    path('device/GetDeviceInfoByDeviceId', views.get_device_info_by_device_id),

    # Dataset
    path('Dataset/GetAllDataset', views.get_all_datasets),
    path('dataset/GetAllDataset', views.get_all_datasets),
    path('Dataset/GetAllDatasetByUserIdAndDeviceId', views.get_datasets_by_user_and_device),
    path('dataset/GetAllDatasetByUserIdAndDeviceId', views.get_datasets_by_user_and_device),
    path('Dataset/CreateNewDataset', views.create_new_dataset),
    path('dataset/CreateNewDataset', views.create_new_dataset),
    path('Dataset/EditDatasetByDsIdAndUserId', views.edit_dataset),
    path('dataset/EditDatasetByDsIdAndUserId', views.edit_dataset),
    path('Dataset/DeleteDatasetByDsIdAndUserId', views.delete_dataset),
    path('dataset/DeleteDatasetByDsIdAndUserId', views.delete_dataset),

    # Publish
    path('publish/GetAllPublishLog', views.get_all_publish_log),
    path('publish/GetPublishLogByUserId', views.get_publish_log_by_user_id),
    path('publish/GetPublishLogByUserToken', views.get_publish_log_by_user_token),
    path('publish/sendToDevice', views.send_to_device),

    # Subscription
    path('Subscription/GetAllSubscriptionTypes', views.get_all_subscription_types),
    path('subscription/GetAllSubscriptionTypes', views.get_all_subscription_types),
    path('Subscription/AddNewSubscription', views.add_new_subscription),
    path('subscription/AddNewSubscription', views.add_new_subscription),
    path('Subscription/GetSubscriptionById', views.get_subscription_by_user),
    path('subscription/GetSubscriptionById', views.get_subscription_by_user),
    path('Subscription/DeleteSubscriptionByUserIdAndDeviceId', views.delete_subscription),
    path('subscription/DeleteSubscriptionByUserIdAndDeviceId', views.delete_subscription),
]
