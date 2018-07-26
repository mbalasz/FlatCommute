from django.http import HttpResponse
from django.template import loader

from commute.models import Flat


def index(request):
    flats = Flat.objects.all()
    template = loader.get_template('commute/index.html')
    context = {
        'flats': flats
    }
    return HttpResponse(template.render(context, request))
