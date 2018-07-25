from django.db import models


class Address(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=100)


class Place(models.Model):
    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    priority = models.IntegerField
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="places_associated")


class Flat(models.Model):
    address = models.ForeignKey(Address, on_delete=models.CASCADE)


CUSTOM = "CUSTOM"
CURRENT_FLAT = "CURRENT_FLAT"
PLACE_TYPE = (
    (CURRENT_FLAT, "Current flat"),
    (CUSTOM, "Custom place")
)

DAY_OF_THE_WEEK = {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday',
}


class Day(models.Model):
    def __init__(self, *args, **kwargs):
        kwargs['choices'] = tuple(sorted(DAY_OF_THE_WEEK.items()))
        kwargs['max_length'] = 1
        super(Day, self).__init__(*args, **kwargs)


class Route(models.Model):
    start_place_type = models.CharField(max_length=15, choices=PLACE_TYPE, default=CURRENT_FLAT)
    start_place_custom = \
        models.ForeignKey(Place, null=True, blank=True, on_delete=models.CASCADE, related_name="routes_starting_here")
    destination_place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_with_this_destination")
    return_place_type = models.CharField(max_length=15, choices=PLACE_TYPE, default=CURRENT_FLAT)
    return_place_custom = \
        models.ForeignKey(Place, null=True, blank=True, on_delete=models.CASCADE, related_name="routes_ending_here")
    day = models.ForeignKey(Day, on_delete=models.CASCADE)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)


class User(models.Model):
    selected_flat = models.ForeignKey(Flat, on_delete=models.CASCADE, related_name="users_with_flat_selected")
    flats = models.ManyToManyField(Flat)
