from django.urls import path
from . import views
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('yara/', views.YARAAnalyzerView.as_view(), name='yara_analyzer'),
    path('sigma/', views.SIGMAAnalyzerView.as_view(), name='sigma_analyzer'),
]