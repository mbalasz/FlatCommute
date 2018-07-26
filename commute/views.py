from django.shortcuts import render

from commute.models import Flat


def index(request):
    flats = Flat.objects.all()
    context = {
        'flats': flats
    }
    return render(request, 'commute/index.html', context)
