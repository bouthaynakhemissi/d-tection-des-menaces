from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    home, RegisterView, login_view, stats_view, last_alerts_view, 
    user_profile_view, ChangePasswordView, user_notifications, 
    trigger_alert, RapportViewSet, RegleViewSet, test_email_view, logout_view,
    ResultatAnalyseViewSet, CorrelationViewSet, security_chat, analyze_yara, analyze_sigma, 
    scan_file, analyze_logs_sigma, get_rapports, csrf_cookie_view, NotificationViewSet, mark_as_read, mark_all_as_read , MarkAsReadNotificationView
)

router = DefaultRouter()
router.register(r'rapports', RapportViewSet)
router.register(r'regles', RegleViewSet)
router.register(r'resultats-analyse', ResultatAnalyseViewSet)
router.register(r'correlations', CorrelationViewSet, basename='correlation')
router.register(r'notifications', NotificationViewSet, basename='notification')
urlpatterns = [
    path('csrf/', csrf_cookie_view),
    path('', home, name='home'),
    path('login/', login_view.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('', include(router.urls)),
    path('stats/', stats_view, name='stats'),
    path('last-alerts/', last_alerts_view, name='last_alerts'),
    path('user_profile/', user_profile_view, name='user_profile'),
    path('user_notifications/', user_notifications, name='user_notifications'),
    path('trigger-alert/', trigger_alert, name='trigger_alert'),
    path('test-email/', test_email_view, name='test_email'),
    path('security-chat/', security_chat, name='security_chat'),
    path('analyze-yara/', analyze_yara, name='analyze_yara'),
    path('analyze-sigma/', analyze_sigma, name='analyze_sigma'),
    path('scan-file/', scan_file, name='scan_file'),
    path('analyze-logs-sigma/',analyze_logs_sigma, name='analyze_logs_sigma'),
    path('get-rapports/', get_rapports, name='get_rapports'),
    path('user_notifications/<int:pk>/mark_as_read/', MarkAsReadNotificationView.as_view(), name='mark_as_read_notification'),
    path('user_notifications/mark_all_as_read/', mark_all_as_read, name='mark_all_as_read'),
]