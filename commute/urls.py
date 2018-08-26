from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('cache/distances', views.cached_distances, name='cached_distances'),
    path('cache/update/distance', views.cache_distance, name='cache_distance'),
    path('totaldaycommute', views.total_day_commute, name='total_day_commute'),
    path('totalweekcommute', views.total_week_commute, name='total_week_commute'),
]
