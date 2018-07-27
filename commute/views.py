from django.shortcuts import render

from commute.models import Flat, Place


def index(request):
    flats = Flat.objects.all()
    places = Place.objects.all()
    context = {
        'flats': flats,
        'places': places,
        'city': "London",
    }
    return render(request, 'commute/index.html', context)
