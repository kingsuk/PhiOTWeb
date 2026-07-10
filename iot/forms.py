from django import forms

INPUT_CLASS = 'input'


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'you@example.com',
        'autocomplete': 'email',
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': '••••••••',
        'autocomplete': 'current-password',
    }))


class RegisterForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'you@example.com',
        'autocomplete': 'email',
    }))
    password = forms.CharField(min_length=6, widget=forms.PasswordInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'At least 6 characters',
        'autocomplete': 'new-password',
    }))
    confirm_password = forms.CharField(min_length=6, widget=forms.PasswordInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'Repeat password',
        'autocomplete': 'new-password',
    }))

    def clean(self):
        cleaned = super().clean()
        password = cleaned.get('password')
        confirm = cleaned.get('confirm_password')
        if password and confirm and password != confirm:
            raise forms.ValidationError('Passwords do not match.')
        return cleaned


class SubscriptionForm(forms.Form):
    subscription_name = forms.CharField(min_length=3, max_length=200, widget=forms.TextInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'Subscription name',
    }))
    subscription_type = forms.IntegerField(widget=forms.HiddenInput())


class DeviceForm(forms.Form):
    device_name = forms.CharField(min_length=3, max_length=200, widget=forms.TextInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'e.g. Garage sensor',
    }))
    subscription_id = forms.ChoiceField(choices=[], widget=forms.Select(attrs={'class': INPUT_CLASS}))
    device_type_id = forms.IntegerField(widget=forms.HiddenInput())


class RenameDeviceForm(forms.Form):
    device_name = forms.CharField(min_length=3, max_length=200, widget=forms.TextInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'Device name',
    }))


class DatasetForm(forms.Form):
    ds_name = forms.CharField(min_length=1, max_length=200, widget=forms.TextInput(attrs={
        'class': INPUT_CLASS,
        'placeholder': 'Dataset name',
    }))
    json_data = forms.CharField(widget=forms.HiddenInput())
    reverse_json_data = forms.CharField(widget=forms.HiddenInput())
