from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('cache/distances', views.cached_distances, name='cached_distances'),
    path('cache/update/distances', views.cache_distances, name='cache_distances'),
]
