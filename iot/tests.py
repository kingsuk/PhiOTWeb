import json
from unittest.mock import patch

from django.test import Client, TestCase, override_settings
from django.urls import reverse

from iot.models import Dataset, Device, DeviceType, PublishLog, Subscription, SubscriptionType, User
from iot.services import business
from iot.services.mqtt import MqttNotConfiguredError


class SeedDataTests(TestCase):
    def test_reference_data_seeded(self):
        self.assertEqual(DeviceType.objects.count(), 2)
        self.assertEqual(SubscriptionType.objects.count(), 3)
        self.assertTrue(SubscriptionType.objects.filter(subscription_type_name='Free').exists())


class BusinessLogicTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='biz@test.com', password='secret12')
        self.plan = SubscriptionType.objects.get(id=1)
        self.subscription = Subscription.objects.create(
            user=self.user,
            subscription_type=self.plan,
            subscription_name='Test Plan',
        )

    def test_register_duplicate_email(self):
        ok, msg = business.register_user('biz@test.com', 'otherpass')
        self.assertFalse(ok)
        self.assertIn('already exists', msg)

    def test_create_device_success(self):
        device, msg = business.create_device(
            self.user, 'MyDevice', 1, self.subscription.id,
        )
        self.assertIsNotNone(device)
        self.assertEqual(len(device.device_token), 15)
        self.assertIn('successfully', msg)

    def test_device_limit_enforced(self):
        business.create_device(self.user, 'Device1', 1, self.subscription.id)
        device, msg = business.create_device(self.user, 'Device2', 1, self.subscription.id)
        self.assertIsNone(device)
        self.assertIn('limit', msg)

    def test_delete_subscription_with_devices_blocked(self):
        business.create_device(self.user, 'Device1', 1, self.subscription.id)
        ok, msg = business.delete_subscription(self.user, self.subscription.id)
        self.assertFalse(ok)
        self.assertIn('active devices', msg)

    def test_publish_without_mqtt_config(self):
        device, _ = business.create_device(self.user, 'PubDevice', 1, self.subscription.id)
        ok, msg = business.publish_message(
            self.user, device.device_token, json.dumps([{'header': 'data', 'data': []}]),
        )
        self.assertFalse(ok)
        self.assertIn('MQTT', msg)

    @patch('iot.services.business.publish_to_device')
    def test_publish_success(self, mock_publish):
        device, _ = business.create_device(self.user, 'PubDevice', 1, self.subscription.id)
        payload = json.dumps([{'header': 'data', 'data': [{'name': 'D0', 'pin': 16, 'value': 1}]}])
        ok, msg = business.publish_message(self.user, device.device_token, payload)
        self.assertTrue(ok)
        mock_publish.assert_called_once()
        self.assertEqual(PublishLog.objects.filter(user=self.user).count(), 1)


class WebFlowTests(TestCase):
    def setUp(self):
        self.client = Client()

    def _register_and_login(self, email='flow@test.com', password='secret12'):
        self.client.post(reverse('register'), {
            'email': email,
            'password': password,
            'confirm_password': password,
        })

    def test_home_redirects_to_login(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('login'))

    def test_register_and_dashboard(self):
        self._register_and_login()
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Devices')

    def test_login_invalid_credentials(self):
        User.objects.create_user(email='user@test.com', password='secret12')
        response = self.client.post(reverse('login'), {
            'email': 'user@test.com',
            'password': 'wrongpass',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Invalid email or password')

    def test_dashboard_requires_auth(self):
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse('login'), response.url)

    def test_full_device_flow(self):
        self._register_and_login()
        self.client.post(reverse('create_subscription'), {
            'subscription_name': 'Home',
            'subscription_type': '1',
        })
        sub = Subscription.objects.get(subscription_name='Home')
        response = self.client.post(
            reverse('new_device') + '?type=1',
            {'device_name': 'Kitchen MCU', 'device_type_id': '1', 'subscription_id': str(sub.id)},
        )
        self.assertEqual(response.status_code, 302)
        device = Device.objects.get(device_name='Kitchen MCU')
        self.assertEqual(device.device_type_id, 1)

        response = self.client.get(reverse('device_nodemcu', args=[device.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Kitchen MCU')
        self.assertContains(response, 'pin-toggles')

    def test_create_dataset(self):
        self._register_and_login()
        self.client.post(reverse('create_subscription'), {
            'subscription_name': 'Home',
            'subscription_type': '1',
        })
        sub = Subscription.objects.get()
        self.client.post(
            reverse('new_device') + '?type=1',
            {'device_name': 'MCU', 'device_type_id': '1', 'subscription_id': str(sub.id)},
        )
        device = Device.objects.get()
        payload = json.dumps([{'header': 'data', 'data': [{'name': 'D0', 'pin': 16, 'value': 1}]}])
        reverse_payload = json.dumps([{'header': 'data', 'data': [{'name': 'D0', 'pin': 16, 'value': 0}]}])
        response = self.client.post(reverse('create_dataset', args=[device.id]), {
            'ds_name': 'Lights',
            'json_data': payload,
            'reverse_json_data': reverse_payload,
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Dataset.objects.filter(ds_device=device).count(), 1)

    def test_delete_device(self):
        self._register_and_login()
        self.client.post(reverse('create_subscription'), {
            'subscription_name': 'Home',
            'subscription_type': '1',
        })
        sub = Subscription.objects.get()
        self.client.post(
            reverse('new_device') + '?type=2',
            {'device_name': 'ESP Unit', 'device_type_id': '2', 'subscription_id': str(sub.id)},
        )
        device = Device.objects.get()
        response = self.client.post(reverse('delete_device', args=[device.id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Device.objects.filter(id=device.id).exists())

    def test_modern_ui_markup(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'auth-card')
        self.assertContains(response, 'Sign in')

        self._register_and_login(email='ui@test.com')
        response = self.client.get(reverse('subscriptions'))
        self.assertContains(response, 'plan-grid')
        self.assertContains(response, 'Get started')


class MqttServiceTests(TestCase):
    def test_validate_json_message(self):
        from iot.services.mqtt import validate_json_message
        result = validate_json_message('[{"header":"data"}]')
        self.assertEqual(json.loads(result), [{'header': 'data'}])

    def test_validate_invalid_json(self):
        from iot.services.mqtt import validate_json_message
        with self.assertRaises(ValueError):
            validate_json_message('not-json')

    def test_publish_raises_when_not_configured(self):
        from iot.services.mqtt import publish_to_device
        with self.assertRaises(MqttNotConfiguredError):
            publish_to_device('token123', '{}')


class ManagementCommandTests(TestCase):
    @override_settings(DEBUG=True, SECRET_KEY='test-secret-key-for-tests-only')
    def test_check_env_passes_in_debug(self):
        from django.core.management import call_command
        call_command('check_env')

    def test_test_mqtt_dry_run_without_host(self):
        from django.core.management import call_command
        from io import StringIO
        err = StringIO()
        with self.assertRaises(SystemExit):
            call_command('test_mqtt', '--dry-run', stderr=err)
        self.assertIn('MQTT_BROKER_HOST', err.getvalue())

    @override_settings(MQTT_BROKER_HOST='broker.test', MQTT_BROKER_PORT=1883)
    def test_test_mqtt_dry_run_with_host(self):
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('test_mqtt', '--dry-run', stdout=out)
        self.assertIn('valid', out.getvalue().lower())
