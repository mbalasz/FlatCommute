from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('cache/distances', views.cached_distances, name='cached_distances'),
    path('cache/update/distance', views.cache_distance, name='cache_distance'),
    path('totalcommute', views.total_commute, name='total_commute'),
]
