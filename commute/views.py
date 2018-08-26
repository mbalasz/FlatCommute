import requests
from datetime import timedelta

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from commute.models import Flat, Place, Route, CURRENT_FLAT, Distance, CYCLE, TRANSIT, Address, DAY_OF_THE_WEEK, NONE


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


def total_week_commute(request):
    flat_id = request.GET.get('flatId')

    total_seconds = 0
    for day in DAY_OF_THE_WEEK:
        total_seconds += __total_day_commute(flat_id, day[0])

    return JsonResponse({'totalMinutes': total_seconds // 60})


def total_day_commute(request):
    flat_id = request.GET.get('flatId')
    day = request.GET.get('day')
    return JsonResponse({'totalMinutes': __total_day_commute(flat_id, day) // 60})


def __total_day_commute(flat_id, day):
    # FIX: Currently we're not caching any distances for routes. For example a route of custom_place to custom_place
    # will never be cached.
    routes = Route.objects.filter(day__contains=day)
    flat = Flat.objects.filter(id=flat_id)[0]
    total_seconds = 0
    for route in routes:
        start_address = flat.address if route.start_place_type == CURRENT_FLAT else route.start_place_custom.address
        total_seconds += get_total_seconds(start_address, route.destination_place.address, TRANSIT)

        return_place_type = route.return_place_type
        if return_place_type != NONE:
            return_address = flat.address if return_place_type == CURRENT_FLAT else route.return_place_custom.address
            total_seconds += get_total_seconds(route.destination_place.address, return_address, TRANSIT)

    return total_seconds


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
