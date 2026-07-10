from django.urls import path

from . import web_views

urlpatterns = [
    path('', web_views.home, name='home'),
    path('auth/', web_views.login_view, name='login'),
    path('register/', web_views.register_view, name='register'),
    path('logout/', web_views.logout_view, name='logout'),
    path('dashboard/', web_views.dashboard, name='dashboard'),
    path('dashboard/new-device/', web_views.new_device, name='new_device'),
    path('device/<int:device_id>/delete/', web_views.delete_device_view, name='delete_device'),
    path('device/<int:device_id>/rename/', web_views.rename_device_view, name='rename_device'),
    path('device/<int:device_id>/check-mqtt/', web_views.check_mqtt_view, name='check_mqtt'),
    path('device/nodemcu/<int:device_id>/', web_views.device_nodemcu, name='device_nodemcu'),
    path('device/esp01/<int:device_id>/', web_views.device_esp, name='device_esp'),
    path('device/<int:device_id>/publish/', web_views.device_publish, name='device_publish'),
    path('device/<int:device_id>/station/', web_views.device_station, name='device_station'),
    path('device/<int:device_id>/dataset/create/', web_views.create_dataset, name='create_dataset'),
    path('device/<int:device_id>/dataset/<int:dataset_id>/edit/', web_views.edit_dataset, name='edit_dataset'),
    path('device/<int:device_id>/dataset/<int:dataset_id>/delete/', web_views.delete_dataset, name='delete_dataset'),
    path('subscriptions/', web_views.subscriptions_list, name='subscriptions'),
    path('subscription/create/', web_views.create_subscription, name='create_subscription'),
    path('subscription/mysubscriptions/', web_views.my_subscriptions, name='my_subscriptions'),
    path('subscription/<int:subscription_id>/delete/', web_views.delete_subscription_view, name='delete_subscription'),
]
