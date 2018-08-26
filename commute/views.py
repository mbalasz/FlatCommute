import requests
from datetime import timedelta

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from commute.models import Flat, Place, Route, CURRENT_FLAT, Distance, CYCLE, TRANSIT, Address


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

    flat = Flat.objects.filter(id=flat_id)[0]

    for place in Place.objects.filter(id__in=(place_ids)):
        distances_query_set = Distance.objects.filter(origin=flat.address, destination=place.address)
        if not distances_query_set:
            continue
        for distance in distances_query_set:
            distances.append({
                'flatId': flat.id,
                'placeId': place.id,
                'minutes': distance.duration.total_seconds() // 60,
                'commuteType': distance.commute_type,
            })

    return JsonResponse({'distances': distances}, safe=False)


def cache_distance(request):
    origin = request.GET.get('origin')
    destination = request.GET.get('destination')
    seconds = request.GET.get('seconds')
    commute_type = get_commute_type_choice(request.GET.get('commuteType'))
    __cache_distance(
        Address.objects.filter(address__iexact=origin)[0],
        Address.objects.filter(address__iexact=destination)[0],
        commute_type,
        seconds)
    return HttpResponse()


def __cache_distance(origin, destination, commute_type, duration_sec):
    Distance.objects.filter(origin=origin, destination=destination, commute_type=commute_type).delete()
    distance = Distance(
        origin=origin,
        destination=destination,
        duration=timedelta(seconds=int(duration_sec)),
        commute_type=commute_type)
    distance.save()


def total_commute(request):
    flat_id = request.GET.get('flatId')
    day = request.GET.get('day')

    routes = Route.objects.filter(day__contains=day)
    flat = Flat.objects.filter(id=flat_id)[0]
    totalSeconds = 0
    for route in routes:
        start_address = flat.address if route.start_place_type else route.start_place_custom.adress
        return_address = flat.address if route.return_place_type else route.return_place_custom.address
        totalSeconds += get_total_seconds(start_address, route.destination_place.address, TRANSIT)
        totalSeconds += get_total_seconds(route.destination_place.address, return_address, TRANSIT)

    return JsonResponse({'totalMinutes': totalSeconds // 60})


def get_total_seconds(origin, destination, commute_type):
    totalSeconds = 0
    distances = Distance.objects.filter(origin=origin, destination=destination, commute_type=commute_type)
    for distance in distances:
        totalSeconds += distance.duration.total_seconds()
    return totalSeconds


def get_commute_type_choice(commute_type_string):
    if commute_type_string == "BICYCLING":
        return CYCLE
    elif commute_type_string == "TRANSIT":
        return TRANSIT
