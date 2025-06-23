
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, update_session_auth_hash, login
from django.http import HttpResponse, JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from django.core.mail import send_mail
from .models import Notification, ResultatAnalyse, Correlation
from .utils import send_email_alert, create_notification
from .serializers import NotificationSerializer, ResultatAnalyseSerializer, CorrelationSerializer
from rest_framework import viewsets, permissions
from .models import Rapport, Regle
from .serializers import RapportSerializer, RegleSerializer 
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseNotAllowed, Http404
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from threat_hunting.ai.security_ai import security_assistant
from threat_hunting.ai.yara_analyzer import YARAAnalyzer
from threat_hunting.ai.sigma_analyzer import SigmaAnalyzer
import yara
from pathlib import Path
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404, redirect
from .models import Rapport  
# --- Vues APIView ---
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import logout
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_protect , ensure_csrf_cookie
import logging
from django.conf import settings
from rest_framework import viewsets
from .models import Notification
from .serializers import NotificationSerializer
import tempfile
import os
from django.shortcuts import get_object_or_404
from twilio.rest import Client
from rest_framework import viewsets
from .models import Machine
from .serializers import MachineSerializer

logger = logging.getLogger(__name__)
# Chemin vers les règles YARA
RULES_PATH = Path(__file__).parent / 'rules' / 'malware_rules.yar'

def home(request):
    return HttpResponse("Bienvenue sur l'API Threat Hunting !")
@api_view(['GET'])
def get_csrf(request):
    """Vue pour obtenir le token CSRF"""
    return JsonResponse({'csrfToken': get_token(request)})
@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({'detail': 'CSRF cookie set'})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
    })

def stats_view(request):
    # Remplace ces valeurs par ta logique réelle (compte dans la base de données)
    return JsonResponse({
        'files_scanned': 123,
        'alerts_count': 5,
    })

def last_alerts_view(request):
    # Remplace par une vraie requête à ta base de données
    alerts = [
        {'description': 'Virus détecté', 'date': '2025-04-24'},
        {'description': 'Malware trouvé', 'date': '2025-04-23'},
    ]
    return JsonResponse(alerts, safe=False)


class RegisterView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            
            # Vérification des champs obligatoires
            if not all([username, email, password]):
                return Response(
                    {'error': 'Tous les champs sont obligatoires'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérification si l'utilisateur existe déjà
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Ce nom d\'utilisateur est déjà pris'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Création de l'utilisateur
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Retourne simplement un message de succès sans token
            return Response({
                'message': 'Inscription réussie. Vous pouvez maintenant vous connecter.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_protect, name='dispatch')
class login_view(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Veuillez fournir un nom d\'utilisateur et un mot de passe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({
                    'message': 'Connexion réussie',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                    }
                })
            return Response(
                {'error': 'Ce compte est désactivé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(
            {'error': 'Identifiants invalides.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        user = request.user

        if not old_password or not new_password:
            return Response({"error": "Les deux champs sont obligatoires."}, status=400)
        if not user.check_password(old_password):
            return Response({"error": "Ancien mot de passe incorrect."}, status=400)
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({"success": True})


# ----------- NOTIFICATIONS --------------

def send_alert_email(subject, message, recipient_list):
    send_mail(
        subject,
        message,
        'bouthaynakhemissi@gmail.com',  # expéditeur (ou None pour DEFAULT_FROM_EMAIL)
        recipient_list,
        fail_silently=False,
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    notifications = Notification.objects.all().order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_alert(request):
    user = request.user
    subject = "Alerte de sécurité"
    message = "Une menace a été détectée sur votre compte."

    # Envoi email
    send_alert_email(subject, message, [user.email])
    create_notification(user, message, notif_type="email")

    # Envoi notification web
    create_notification(user, message, notif_type="web")

    # Envoi SMS (optionnel)
    # send_sms_alert(user, message)
    # create_notification(user, message, notif_type="sms")

    return Response({"success": True})

@api_view(['POST'])
@permission_classes([AllowAny])
def test_email_view(request):
    try:
        subject = request.data.get('subject', "Test d'envoi d'email")
        message = request.data.get('message', "Ceci est un test d'envoi d'email depuis l'application.")
        from_email = settings.EMAIL_HOST_USER
        email = request.data.get('email')

        if not email:
            return JsonResponse({'success': False, 'error': 'Email requis'}, status=400)

        send_mail(
            subject,
            message,
            from_email,
            [email],
            fail_silently=False,
        )

        # Création de la notification
        Notification.objects.create(
            user=None,
            notif_type="EMAIL",
            message=f"Sujet: {subject}\n{message}",
            recipient=email
        )

        return JsonResponse({
            'success': True,
            'message': 'Email envoyé avec succès'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

class RapportViewSet(viewsets.ModelViewSet):
    queryset = Rapport.objects.all()
    serializer_class = RapportSerializer
    permission_classes = [permissions.AllowAny]  # Permet l'accès sans authentification
    
    def perform_create(self, serializer):
        # Si l'utilisateur n'est pas connecté, on ne spécifie pas le createur
        if self.request.user.is_authenticated:
            serializer.save(createur=self.request.user)
        else:
            serializer.save()

@csrf_exempt
def get_rapports(request):
    try:
        rapports = Rapport.objects.all().order_by('-date_debut')
        data = [{
            'id': r.id,
            'type_rapport': r.type_rapport,
            'titre': r.titre,
            'description': r.description,
            'date_debut': r.date_debut.strftime('%Y-%m-%d'),
            'date_fin': r.date_fin.strftime('%Y-%m-%d'),
            'createur': r.createur.username if r.createur else "Anonyme",
        } for r in rapports]
        return JsonResponse(data, safe=False)
    except Exception as e:
        print(f"Erreur dans get_rapports: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

class RegleViewSet(viewsets.ModelViewSet):
    queryset = Regle.objects.all()
    serializer_class = RegleSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Si l'utilisateur est authentifié, utiliser son ID
        if self.request.user.is_authenticated:
            serializer.save()
        else:
            # Sinon, créer un utilisateur anonyme si nécessaire
            try:
                anonymous_user = User.objects.get(username='anonymous')
            except User.DoesNotExist:
                anonymous_user = User.objects.create_user(username='anonymous', password='anonymous')
            serializer.save()

    def perform_update(self, serializer):
        # Ne pas permettre la modification du type de règle
        instance = self.get_object()
        type_regle = instance.type
        
        # Validation des champs obligatoires
        if not serializer.validated_data.get('nom'):
            raise serializers.ValidationError("Le nom est obligatoire")
        if not serializer.validated_data.get('contenu'):
            raise serializers.ValidationError("Le contenu est obligatoire")
        
        # Mettre à jour la règle
        serializer.save(type=type_regle)

class ResultatAnalyseViewSet(viewsets.ModelViewSet):
    queryset = ResultatAnalyse.objects.all()
    serializer_class = ResultatAnalyseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ResultatAnalyse.objects.all()
        type_analyse = self.request.query_params.get('type_analyse')
        severite = self.request.query_params.get('severite')
        
        if type_analyse:
            queryset = queryset.filter(type_analyse=type_analyse)
        if severite:
            queryset = queryset.filter(severite=severite)
            
        return queryset.order_by('-date_analyse')

class CorrelationViewSet(viewsets.ModelViewSet):
    queryset = Correlation.objects.all()
    serializer_class = CorrelationSerializer
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def correlater(self, request):
        """
        Effectue une corrélation entre les résultats YARA et SIGMA
        """
        # Récupérer les résultats récents (par exemple, des dernières 24h)
        from django.utils import timezone
        from datetime import timedelta
        
        date_limite = timezone.now() - timedelta(days=1)
        
        # Récupérer les résultats YARA et SIGMA
        resultats_yara = ResultatAnalyse.objects.filter(
            type_analyse='YARA',
            date_analyse__gte=date_limite
        )
        
        resultats_sigma = ResultatAnalyse.objects.filter(
            type_analyse='SIGMA',
            date_analyse__gte=date_limite
        )
        
        correlations_trouvees = []
        
        # Logique de corrélation simple (à personnaliser selon les besoins)
        for yara in resultats_yara:
            for sigma in resultats_sigma:
                # Exemple de logique de corrélation :
                # - Même fichier analysé
                # - Mots-clés communs dans les résultats
                # - Proximité temporelle
                
                # Ici, on vérifie si c'est le même fichier et s'ils sont proches dans le temps
                if (yara.fichier_analyse and sigma.fichier_analyse and 
                    yara.fichier_analyse == sigma.fichier_analyse and
                    abs((yara.date_analyse - sigma.date_analyse).total_seconds()) < 3600):  # 1 heure d'écart
                    
                    # Créer une corrélation
                    correlation = Correlation.objects.create(
                        description=f"Corrélation détectée entre une règle YARA et une règle SIGMA sur le fichier {yara.fichier_analyse}",
                        score_confiance=0.8,  # Score de confiance (à affiner)
                        menace=f"Menace potentielle détectée dans {yara.fichier_analyse}"
                    )
                    correlation.resultats.set([yara, sigma])
                    correlations_trouvees.append(correlation)
        
        serializer = self.get_serializer(correlations_trouvees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def resultats(self, request, pk=None):
        """Récupère les résultats d'analyse associés à une corrélation"""
        correlation = self.get_object()
        resultats = correlation.resultats.all()
        serializer = ResultatAnalyseSerializer(resultats, many=True)
        return Response(serializer.data)



@csrf_exempt
@require_http_methods(["POST"])
def security_chat(request):
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        
        # Traitement des commandes spéciales
        if message.startswith('/yara '):
            rule = message[6:].strip()
            result = security_assistant.analyze_yara_rule(rule)
            return JsonResponse(result)
            
        elif message.startswith('/sigma '):
            rule = message[7:].strip()
            result = security_assistant.analyze_sigma_rule(rule)
            return JsonResponse(result)
            
        elif message.startswith('/search '):
            query = message[8:].strip()
            results = security_assistant.search_threat_intel(query)
            return JsonResponse({"results": results})
            
        # Réponse générée par l'IA
        response = security_assistant.generate_response(message)
        return JsonResponse(response)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_logs_sigma(request):
    try:
        data = request.data
        logs = data.get('logs', [])
        log_source = data.get('log_source', None)

        if not isinstance(logs, list) or not logs:
            return Response({"error": "Les logs doivent être fournis dans une liste non vide"}, status=status.HTTP_400_BAD_REQUEST)

        analyzer = SigmaAnalyzer()
        results = analyzer.analyze_logs(logs, log_source)

        return Response({
            "status": "success",
            "matches": len(results),
            "results": results
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"Erreur lors de l'analyse: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@csrf_exempt
def scan_file(request):
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'Aucun fichier n\'a été envoyé'}, status=400)

        uploaded_file = request.FILES['file']
        
        try:
            # Compiler les règles YARA
            # Définit d'abord le chemin
            RULES_PATH = Path(__file__).parent / 'rules' / 'malware_rules.yar'
            print("Chemin utilisé pour YARA :", str(RULES_PATH))
            print("Fichier existe ? :", RULES_PATH.exists())
            rules = yara.compile(filepath=str(RULES_PATH))
            
            # Créer un fichier temporaire pour l'analyse
           
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Analyser le fichier
            matches = rules.match(temp_file_path)
            
            # Supprimer le fichier temporaire
            os.unlink(temp_file_path)
            
            # Préparer la réponse
            if matches:
                return JsonResponse({
                    'status': 'alert',
                    'matches': [{
                        'rule': match.rule,
                        'tags': list(match.tags),
                        'meta': match.meta
                    } for match in matches],
                    'message': 'Fichier potentiellement malveillant détecté'
                })
            else:
                return JsonResponse({
                    'status': 'safe',
                    'message': 'Aucune signature malveillante détectée'
                })
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Méthode non supportée'}, status=405)
@csrf_exempt
@require_http_methods(["POST"])
def analyze_yara(request):
    try:
        # Récupérer le fichier envoyé
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return JsonResponse({"error": "Aucun fichier n'a été envoyé"}, status=400)

        # Chemin vers les règles YARA
        rules_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'rules', 'malware_rules.yar')
        
        # Initialiser l'analyseur YARA
        yara_analyzer = YARAAnalyzer(rules_path)
        
        # Sauvegarder temporairement le fichier
        temp_file_path = os.path.join('/tmp', uploaded_file.name)
        with open(temp_file_path, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        # Analyser le fichier
        matches = yara_analyzer.analyze_file(temp_file_path)
        
        # Supprimer le fichier temporaire
        os.remove(temp_file_path)
        
        return JsonResponse({
            'status': 'success',
            'matches': matches,
            'message': f"Analyse terminée pour {uploaded_file.name}"
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def analyze_sigma(request):
    try:
        data = json.loads(request.body)
        rule_content = data.get('rule', '')
        
        sigma_analyzer = SigmaAnalyzer("path/to/sigma/config")
        result = sigma_analyzer.parse_rule(rule_content)
        
        if data.get('search_rules'):
            query = data.get('query', '')
            rules_dir = data.get('rules_dir', 'path/to/sigma/rules')
            search_results = sigma_analyzer.search_rules(query, rules_dir)
            result['search_results'] = search_results
            
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@api_view(['Post'])
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Déconnexion réussie'})       


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


def mark_as_read(request, pk):
    if request.method in ["PATCH", "POST"]:
        try:
            notification = Notification.objects.get(pk=pk)
            notification.read = True
            notification.save()
            return JsonResponse({'success': True})
        except Notification.DoesNotExist:
            raise Http404("Notification not found")
    return HttpResponseNotAllowed(['PATCH', 'POST'])
@csrf_exempt
@csrf_exempt
def mark_all_as_read(request):
    if request.method in ['POST', 'PATCH']:
        Notification.objects.all().update(is_read=True)
        return JsonResponse({'success': True})
    return HttpResponseNotAllowed(['POST', 'PATCH'])

class MarkAsReadNotificationView(APIView):
    def patch(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk)
        notif.is_read = True
        notif.save()
        return Response({'status': 'Notification marked as read'}, status=status.HTTP_200_OK)


def send_sms(to, message):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=message,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to
    )

def create(self, request, *args, **kwargs):
    data = request.data.copy()
    data['user'] = request.user.pk  # ou request.user selon la config
    serializer = self.get_serializer(data=data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer



@csrf_exempt  # Pour tester rapidement, mais il vaut mieux gérer le CSRF proprement ensuite
def supprimer_rapport(request, rapport_id):
    if request.method == "POST":
        rapport = get_object_or_404(Rapport, id=rapport_id)
        rapport.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)