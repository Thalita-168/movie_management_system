from django import forms
from .models import Booking


class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['seats']
        widgets = {
            'seats': forms.NumberInput(attrs={
                'class': 'form-input',
                'min': '1',
                'placeholder': 'Number of seats'
            })
        }
    
    def __init__(self, *args, showtime=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.showtime = showtime
        
        if showtime:
            self.fields['seats'].widget.attrs['max'] = showtime.available_seats
    
    def clean_seats(self):
        seats = self.cleaned_data.get('seats')
        
        if seats < 1:
            raise forms.ValidationError('You must book at least 1 seat.')
        
        if self.showtime and seats > self.showtime.available_seats:
            raise forms.ValidationError(
                f'Only {self.showtime.available_seats} seats available.'
            )
        
        return seats
