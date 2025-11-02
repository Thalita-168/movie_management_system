from django import forms
from .models import Movie, Showtime, Genre


class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = ['title', 'description', 'genres', 'duration', 'rating', 
                  'release_date', 'poster', 'cast', 'director', 'language', 'is_active']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input'}),
            'description': forms.Textarea(attrs={'class': 'form-input', 'rows': 4}),
            'genres': forms.CheckboxSelectMultiple(),
            'duration': forms.NumberInput(attrs={'class': 'form-input'}),
            'rating': forms.NumberInput(attrs={'class': 'form-input', 'step': '0.1'}),
            'release_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'poster': forms.FileInput(attrs={'class': 'form-input'}),
            'cast': forms.Textarea(attrs={'class': 'form-input', 'rows': 2}),
            'director': forms.TextInput(attrs={'class': 'form-input'}),
            'language': forms.TextInput(attrs={'class': 'form-input'}),
        }


class ShowtimeForm(forms.ModelForm):
    class Meta:
        model = Showtime
        fields = ['movie', 'show_date', 'show_time', 'price', 'total_seats', 'screen_number']
        widgets = {
            'movie': forms.Select(attrs={'class': 'form-input'}),
            'show_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'show_time': forms.TimeInput(attrs={'class': 'form-input', 'type': 'time'}),
            'price': forms.NumberInput(attrs={'class': 'form-input', 'step': '0.01'}),
            'total_seats': forms.NumberInput(attrs={'class': 'form-input'}),
            'screen_number': forms.NumberInput(attrs={'class': 'form-input'}),
        }
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.available_seats = instance.total_seats
        if commit:
            instance.save()
        return instance


class MovieSearchForm(forms.Form):
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Search movies...'
        })
    )
    genre = forms.ModelChoiceField(
        queryset=Genre.objects.all(),
        required=False,
        empty_label='All Genres',
        widget=forms.Select(attrs={'class': 'form-input'})
    )
    sort_by = forms.ChoiceField(
        required=False,
        choices=[
            ('', 'Default'),
            ('title', 'Title (A-Z)'),
            ('-title', 'Title (Z-A)'),
            ('-release_date', 'Newest First'),
            ('release_date', 'Oldest First'),
            ('-rating', 'Highest Rated'),
            ('rating', 'Lowest Rated'),
        ],
        widget=forms.Select(attrs={'class': 'form-input'})
    )
