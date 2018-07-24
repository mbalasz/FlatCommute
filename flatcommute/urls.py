from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('commute/', include('commute.urls')),
    path('admin/', admin.site.urls),
]

