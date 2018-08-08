from datetime import timedelta

from django.db import models
from multiselectfield import MultiSelectField


class Address(models.Model):
    address = models.CharField(max_length=100)

    def __str__(self):
        return self.address


class Place(models.Model):
    name = models.CharField(max_length=50)
    address = models.ForeignKey(Address, on_delete=models.CASCADE)
    priority = models.IntegerField
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="places_associated")

    def __str__(self):
        return self.name + " (" + self.address.address + ")"


class Flat(models.Model):
    address = models.ForeignKey(Address, on_delete=models.CASCADE)

    def __str__(self):
        return self.address.address


DAY_OF_THE_WEEK = (
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
    ('Sunday', 'Sunday')
)


CUSTOM = 0
CURRENT_FLAT = 1
PLACE_TYPE = (
    (CURRENT_FLAT, "Current flat"),
    (CUSTOM, "Custom place")
)

CYCLE = "cycle"
TRANSIT = "transit"
COMMUTE_TYPE = (
    (CYCLE, "Cycling"),
    (TRANSIT, "Transit")
)


class Distance(models.Model):
    origin = models.ForeignKey(Flat, on_delete=models.CASCADE)
    destination = models.ForeignKey(Place, on_delete=models.CASCADE)
    duration = models.DurationField(default=timedelta(minutes=0))
    commute_type = models.CharField(max_length=15, choices=COMMUTE_TYPE, default=TRANSIT)

    def __str__(self):
        return self.origin.address.address + " -> " + self.destination.name + " [" + self.commute_type + "]"


class Route(models.Model):
    start_place_type = models.IntegerField(choices=PLACE_TYPE, default=CURRENT_FLAT)
    start_place_custom = \
        models.ForeignKey(Place, null=True, blank=True, on_delete=models.CASCADE, related_name="routes_starting_here")
    destination_place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_with_this_destination")
    return_place_type = models.IntegerField(choices=PLACE_TYPE, default=CURRENT_FLAT)
    return_place_custom = \
        models.ForeignKey(Place, null=True, blank=True, on_delete=models.CASCADE, related_name="routes_ending_here")
    day = MultiSelectField(choices=DAY_OF_THE_WEEK, default=None)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)

    def __str__(self):
        return "Route to " + self.destination_place.name


class User(models.Model):
    name = models.CharField(max_length=15)
    selected_flat = models.ForeignKey(Flat, on_delete=models.CASCADE, related_name="users_with_flat_selected")
    flats = models.ManyToManyField(Flat)

    def __str__(self):
        return self.name
