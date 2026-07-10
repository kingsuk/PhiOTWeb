import json

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST

from iot.forms import DatasetForm, DeviceForm, LoginForm, RegisterForm, SubscriptionForm
from iot.models import Dataset, Device, Subscription, SubscriptionType
from iot.services import business

NODEMCU_PINS = [
    {'name': 'D0', 'pin': 16, 'value': 0},
    {'name': 'D1', 'pin': 5, 'value': 0},
    {'name': 'D2', 'pin': 4, 'value': 0},
    {'name': 'D3', 'pin': 0, 'value': 0},
    {'name': 'D4', 'pin': 2, 'value': 0},
    {'name': '3V3', 'value': 2},
    {'name': 'GND', 'value': 2},
    {'name': 'D5', 'pin': 14, 'value': 0},
    {'name': 'D6', 'pin': 12, 'value': 0},
    {'name': 'D7', 'pin': 13, 'value': 0},
    {'name': 'D8', 'pin': 15, 'value': 0},
    {'name': 'D9', 'pin': 3, 'value': 0},
    {'name': 'D10', 'pin': 1, 'value': 0},
    {'name': 'GND', 'value': 2},
    {'name': '3V3', 'value': 2},
]

ESP_PINS = [
    {'name': 'GPIO 0', 'pin': 0, 'value': 0},
    {'name': 'GPIO 2', 'pin': 2, 'value': 0},
]


def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')


@require_http_methods(['GET', 'POST'])
def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    form = LoginForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = authenticate(
            request,
            email=form.cleaned_data['email'],
            password=form.cleaned_data['password'],
        )
        if user:
            login(request, user, backend='iot.backends.BcryptEmailBackend')
            messages.success(request, 'Login successful.')
            return redirect('dashboard')
        messages.error(request, 'Invalid email or password.')

    return render(request, 'iot/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@require_http_methods(['GET', 'POST'])
def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    form = RegisterForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        ok, message = business.register_user(
            form.cleaned_data['email'],
            form.cleaned_data['password'],
        )
        if ok:
            messages.success(request, message)
            user = authenticate(
                request,
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
            )
            if user:
                login(request, user, backend='iot.backends.BcryptEmailBackend')
            return redirect('dashboard')
        messages.error(request, message)

    return render(request, 'iot/register.html', {'form': form})


@login_required
def dashboard(request):
    devices = Device.objects.filter(user=request.user).order_by('-created_date')
    return render(request, 'iot/dashboard.html', {'devices': devices})


@login_required
@require_POST
def delete_device_view(request, device_id):
    ok, message = business.delete_device(request.user, device_id)
    if ok:
        messages.success(request, message)
    else:
        messages.error(request, message)
    return redirect('dashboard')


@login_required
@require_http_methods(['GET', 'POST'])
def new_device(request):
    subscriptions = Subscription.objects.filter(user=request.user).order_by('-created_date')
    if not subscriptions.exists():
        messages.warning(request, "You need a subscription before adding a device.")
        return redirect('subscriptions')

    device_type_param = request.GET.get('type') or request.POST.get('device_type_id')
    show_form = device_type_param is not None

    form = None
    device_type_id = 1
    device_type_name = 'Esp8266 NodeMCU'

    if show_form:
        device_type_id = int(device_type_param)
        device_type_name = 'Esp8266 NodeMCU' if device_type_id == 1 else 'Esp8266-01'
        form = DeviceForm(request.POST or None, initial={'device_type_id': device_type_id})
        form.fields['subscription_id'].choices = [
            (str(sub.id), f"{sub.subscription_name} ({business.subscription_type_name(sub.subscription_type_id)})")
            for sub in subscriptions
        ]

        if request.method == 'POST' and form.is_valid():
            device, message = business.create_device(
                request.user,
                form.cleaned_data['device_name'],
                int(form.cleaned_data['device_type_id']),
                int(form.cleaned_data['subscription_id']),
            )
            if device:
                messages.success(request, message)
                if device.device_type_id == 1:
                    return redirect('device_nodemcu', device_id=device.id)
                return redirect('device_esp', device_id=device.id)
            messages.error(request, message)

    return render(request, 'iot/new_device.html', {
        'form': form,
        'show_form': show_form,
        'device_type_id': device_type_id,
        'device_type_name': device_type_name,
        'subscriptions': subscriptions,
    })


@login_required
def subscriptions_list(request):
    plans = SubscriptionType.objects.all().order_by('id')
    form = SubscriptionForm()
    return render(request, 'iot/subscriptions.html', {
        'plans': plans,
        'form': form,
    })


@login_required
@require_POST
def create_subscription(request):
    form = SubscriptionForm(request.POST)
    if form.is_valid():
        ok, message = business.create_subscription(
            request.user,
            form.cleaned_data['subscription_type'],
            form.cleaned_data['subscription_name'],
        )
        if ok:
            messages.success(request, message)
            return redirect('dashboard')
        messages.error(request, message)
    else:
        messages.error(request, 'Please provide a valid subscription name.')
    return redirect('subscriptions')


@login_required
def my_subscriptions(request):
    subscriptions = Subscription.objects.filter(user=request.user).order_by('-created_date')
    return render(request, 'iot/my_subscriptions.html', {'subscriptions': subscriptions})


@login_required
@require_POST
def delete_subscription_view(request, subscription_id):
    ok, message = business.delete_subscription(request.user, subscription_id)
    if ok:
        messages.success(request, message)
    else:
        messages.error(request, message)
    return redirect('my_subscriptions')


def _device_control_context(request, device_id, pin_config, template_name):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    device_obj, error = business.get_device_with_limits(device_id)
    if error:
        messages.error(request, error)
        return None, redirect('dashboard')

    datasets = Dataset.objects.filter(ds_device=device, ds_user=request.user)
    datasets_for_js = [
        {'id': ds.id, 'json_data': ds.json_data}
        for ds in datasets
    ]
    return render(request, template_name, {
        'device': device,
        'datasets': datasets,
        'datasets_for_js': json.dumps(datasets_for_js),
        'pin_config_json': json.dumps(pin_config),
        'default_config_json': json.dumps(pin_config),
    }), None


@login_required
def device_nodemcu(request, device_id):
    response, redirect_to = _device_control_context(
        request, device_id, NODEMCU_PINS, 'iot/device_nodemcu.html',
    )
    if redirect_to:
        return redirect_to
    return response


@login_required
def device_esp(request, device_id):
    response, redirect_to = _device_control_context(
        request, device_id, ESP_PINS, 'iot/device_esp.html',
    )
    if redirect_to:
        return redirect_to
    return response


@login_required
@require_POST
def device_publish(request, device_id):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    message = request.POST.get('message', '')
    ok, result_message = business.publish_message(request.user, device.device_token, message)
    if ok:
        messages.success(request, result_message)
    else:
        messages.error(request, result_message)

    if device.device_type_id == 1:
        return redirect('device_nodemcu', device_id=device.id)
    return redirect('device_esp', device_id=device.id)


@login_required
@require_POST
def device_station(request, device_id):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    message = json.dumps([{'header': 'station'}])
    ok, result_message = business.publish_message(request.user, device.device_token, message)
    if ok:
        messages.success(request, result_message)
    else:
        messages.error(request, result_message)

    if device.device_type_id == 1:
        return redirect('device_nodemcu', device_id=device.id)
    return redirect('device_esp', device_id=device.id)


@login_required
@require_POST
def create_dataset(request, device_id):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    form = DatasetForm(request.POST)
    if form.is_valid():
        Dataset.objects.create(
            ds_name=form.cleaned_data['ds_name'],
            ds_user=request.user,
            ds_device=device,
            json_data=form.cleaned_data['json_data'],
            reverse_json_data=form.cleaned_data['reverse_json_data'],
        )
        messages.success(request, 'Dataset created successfully.')
    else:
        messages.error(request, 'Invalid dataset data.')

    if device.device_type_id == 1:
        return redirect('device_nodemcu', device_id=device.id)
    return redirect('device_esp', device_id=device.id)


@login_required
@require_POST
def edit_dataset(request, device_id, dataset_id):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    dataset = get_object_or_404(Dataset, id=dataset_id, ds_user=request.user, ds_device=device)
    json_data = request.POST.get('json_data', '')
    reverse_json_data = request.POST.get('reverse_json_data', '')
    dataset.json_data = json_data
    dataset.reverse_json_data = reverse_json_data
    dataset.save()
    messages.success(request, 'Dataset updated successfully.')

    if device.device_type_id == 1:
        return redirect('device_nodemcu', device_id=device.id)
    return redirect('device_esp', device_id=device.id)


@login_required
@require_POST
def delete_dataset(request, device_id, dataset_id):
    device = get_object_or_404(Device, id=device_id, user=request.user)
    Dataset.objects.filter(id=dataset_id, ds_user=request.user, ds_device=device).delete()
    messages.success(request, 'Dataset deleted successfully.')

    if device.device_type_id == 1:
        return redirect('device_nodemcu', device_id=device.id)
    return redirect('device_esp', device_id=device.id)
