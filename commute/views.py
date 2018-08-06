from datetime import timedelta

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from commute.models import Flat, Place, Route, CURRENT_FLAT, Distance, CYCLE, TRANSIT


def index(request):
    flats = Flat.objects.all()
    places = Place.objects.all()
    routes = Route.objects.all()

    context = {
        'flats': flats,
        'places': places,
        'routes': routes,
        'city': "London",
    }
    return render(request, 'commute/index.html', context)


def cached_distances(request):
    flat_id = request.GET.get('flatId')
    place_ids = request.GET.getlist('placeIds[]')
    distances = []

    for place_id in place_ids:
        distances_query_set = Distance.objects.filter(origin=flat_id, destination=place_id)
        if not distances_query_set:
            continue
        for distance in distances_query_set:
            distances.append({
                'flatId': flat_id,
                'placeId': place_id,
                'minutes': distance.duration.total_seconds() // 60,
                'commuteType': distance.commute_type,
            })

    return JsonResponse({'distances': distances}, safe=False)


def cache_distances(request):
    flat_id = request.GET.get('flatId')
    place_id = request.GET.get('placeId')
    seconds = request.GET.get('seconds')
    commute_type = get_commute_type_choice(request.GET.get('commuteType'))
    Distance.objects.filter(origin_id=flat_id, destination_id=place_id, commute_type=commute_type).delete()
    distance = Distance(
        origin_id=flat_id,
        destination_id=place_id,
        duration=timedelta(seconds=int(seconds)),
        commute_type=commute_type)
    distance.save()
    return HttpResponse()


def get_commute_type_choice(commute_type_string):
    if commute_type_string == "BICYCLING":
        return CYCLE
    elif commute_type_string == "TRANSIT":
        return TRANSIT
