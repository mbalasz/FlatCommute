from django.contrib import admin

# Register your models here.
from commute.models import Place, Flat, Route, User

admin.site.register(Place)
admin.site.register(Flat)
admin.site.register(Route)
admin.site.register(User)
