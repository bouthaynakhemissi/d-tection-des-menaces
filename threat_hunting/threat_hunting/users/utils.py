from django.core.mail import send_mail
from django.conf import settings
from .models import Notification
from twilio.rest import Client
from django.template.loader import render_to_string
from django.core.mail import send_mail 
from .models import Notification
from django.utils import timezone
from .models import Rapport 

def send_email_alert(user, subject, message):
    email_body = render_to_string('alert_email.txt', {
        'user': user,
        'message': message,
    })
    send_mail(
        subject,
        email_body,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )

def create_notification(user, message, notif_type="web"):
    Notification.objects.create(user=user, message=message, notif_type=notif_type)

def send_sms_alert(user, message):
    account_sid = 'YOUR_TWILIO_SID'
    auth_token = 'YOUR_TWILIO_TOKEN'
    client = Client(account_sid, auth_token)
    client.messages.create(
        body=message,
        from_='94646413',  # Ton numéro Twilio
        to=user.profile.phone_number  # Ajoute ce champ dans le modèle User si besoin
    )
    Notification.objects.create(
        user=user,
        message="hello",
        notif_type="email"  # ou "web", "sms"
    )


def generer_rapport_incidents():
    incidents = Incident.objects.all()
    rapport = {
        'total_incidents': incidents.count(),
        'par_severite': {
            'faible': incidents.filter(severity='LOW').count(),
            'moyen': incidents.filter(severity='MEDIUM').count(),
            'eleve': incidents.filter(severity='HIGH').count(),
            'critique': incidents.filter(severity='CRITICAL').count()
        },
        'par_statut': {
            'nouveau': incidents.filter(status='NEW').count(),
            'en_cours': incidents.filter(status='IN_PROGRESS').count(),
            'resolu': incidents.filter(status='RESOLVED').count(),
            'ferme': incidents.filter(status='CLOSED').count()
        },
        'derniers_30_jours': incidents.filter(created_at__gte=timezone.now() - timezone.timedelta(days=30)).count(),
        'par_utilisateur': {user.username: incidents.filter(reported_by=user).count() 
                           for user in User.objects.all()}
    }
    return rapport