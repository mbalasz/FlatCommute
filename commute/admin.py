from django.contrib import admin

# Register your models here.
from commute.models import Place, Flat, Route, User, Address, Distance

admin.site.register(Place)
admin.site.register(Flat)
admin.site.register(Route)
admin.site.register(User)
admin.site.register(Address)
admin.site.register(Distance)
