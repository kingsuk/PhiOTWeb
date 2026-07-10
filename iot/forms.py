from django import forms


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'form-control',
        'placeholder': 'Type your email',
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Type your password',
    }))


class RegisterForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'form-control',
        'placeholder': 'Email',
    }))
    password = forms.CharField(min_length=6, widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Password',
    }))
    confirm_password = forms.CharField(min_length=6, widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Confirm Password',
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
        'class': 'form-control',
        'placeholder': 'Subscription name',
    }))
    subscription_type = forms.IntegerField(widget=forms.HiddenInput())


class DeviceForm(forms.Form):
    device_name = forms.CharField(min_length=3, max_length=200, widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Device name',
    }))
    subscription_id = forms.ChoiceField(choices=[], widget=forms.Select(attrs={'class': 'form-control'}))
    device_type_id = forms.IntegerField(widget=forms.HiddenInput())


class DatasetForm(forms.Form):
    ds_name = forms.CharField(min_length=1, max_length=200, widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Dataset name',
    }))
    json_data = forms.CharField(widget=forms.HiddenInput())
    reverse_json_data = forms.CharField(widget=forms.HiddenInput())
