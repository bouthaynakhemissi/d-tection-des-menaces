import os
import sys
import json

# Ajouter le chemin du projet au PYTHONPATH
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'threat_hunting.settings')

import django
django.setup()

from django.contrib.auth.models import User
from users.models import Regle, ResultatAnalyse, Correlation
from django.utils import timezone

def creer_utilisateur_et_regles():
    """Crée un utilisateur et des règles de test si nécessaire"""
    # Créer un utilisateur admin s'il n'existe pas
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        user.set_password('admin123')
        user.save()
    
    # Créer des règles de test
    regle_yara, _ = Regle.objects.get_or_create(
        nom='Regle YARA Test',
        type='YARA',
        contenu='rule test_rule { condition: true }',
        description='Règle YARA de test pour la démonstration'
    )
    
    regle_sigma, _ = Regle.objects.get_or_create(
        nom='Regle SIGMA Test',
        type='SIGMA',
        contenu='title: Test Rule\ndescription: Test\ndetection:\n  selection:\n    EventID: 1\n  condition: selection',
        description='Règle SIGMA de test pour la démonstration'
    )
    
    return regle_yara, regle_sigma

def creer_exemples_analyses():
    """Crée des exemples de résultats d'analyse"""
    regle_yara, regle_sigma = creer_utilisateur_et_regles()
    
    # Exemple de résultat YARA
    resultat_yara = ResultatAnalyse.objects.create(
        type_analyse='YARA',
        regle=regle_yara,
        fichier_analyse='C:/Windows/System32/notepad.exe',
        resultat={
            'matches': [
                {
                    'rule': 'suspicious_executable',
                    'matches': True,
                    'strings': ['MZ', 'This program cannot be run in DOS mode'],
                    'tags': ['executable', 'windows']
                }
            ]
        },
        severite='HIGH'
    )
    
    # Exemple de résultat SIGMA
    resultat_sigma = ResultatAnalyse.objects.create(
        type_analyse='SIGMA',
        regle=regle_sigma,
        fichier_analyse='C:/Windows/System32/notepad.exe',
        resultat={
            'event_id': 1,
            'details': 'Suspicious process execution detected',
            'process_path': 'C:\\Windows\\System32\\notepad.exe',
            'tags': ['execution', 'suspicious']
        },
        severite='MEDIUM',
        date_analyse=timezone.now()
    )
    
    return resultat_yara, resultat_sigma

def effectuer_correlation():
    """Effectue une corrélation entre les résultats d'analyse"""
    from users.views import CorrelationViewSet
    from rest_framework.test import APIRequestFactory
    from rest_framework.test import force_authenticate
    
    # Créer un utilisateur admin pour l'authentification
    user = User.objects.get(username='admin')
    
    # Créer une requête POST pour déclencher la corrélation
    factory = APIRequestFactory()
    request = factory.post('/correlations/correlater/')
    force_authenticate(request, user=user)
    
    # Appeler la vue de corrélation
    view = CorrelationViewSet.as_view({'post': 'correlater'})
    response = view(request)
    
    # Afficher les résultats
    print("Résultat de la corrélation:")
    print(json.dumps(response.data, indent=2, ensure_ascii=False))
    
    return response

def lister_correlations():
    """Affiche la liste des corrélations existantes"""
    correlations = Correlation.objects.all()
    
    if not correlations.exists():
        print("Aucune corrélation trouvée.")
        return
    
    print("\nListe des corrélations:")
    for corr in correlations:
        print(f"\nID: {corr.id}")
        print(f"Description: {corr.description}")
        print(f"Score de confiance: {corr.score_confiance}")
        print(f"Menace: {corr.menace}")
        print("Résultats associés:")
        for res in corr.resultats.all():
            print(f"  - {res.type_analyse}: {res.regle.nom if res.regle else 'Aucune règle'}")

if __name__ == "__main__":
    print("Création d'exemples de résultats d'analyse...")
    yara, sigma = creer_exemples_analyses()
    print(f"Résultats créés: YARA(ID={yara.id}), SIGMA(ID={sigma.id})")
    
    print("\nEffectuer une corrélation...")
    effectuer_correlation()
    
    print("\nListe des corrélations:")
    lister_correlations()
