from django.test import TestCase
from rest_framework.test import APITestCase
from threat_hunting.ai.sigma_analyzer import SigmaAnalyzer
import time
from threat_hunting.ai.security_ai import SecurityAIAssistant

class SigmaAnalyzerTestCase(TestCase):
    def test_sigma_analyzer_initialization(self):
        analyzer = SigmaAnalyzer()
        self.assertIsNotNone(analyzer)



class SigmaAnalyzerTest(TestCase):
    def test_analyzer_initialization(self):
        """Vérifie que l'analyseur se charge correctement"""
        analyzer = SigmaAnalyzer()
        self.assertIsNotNone(analyzer)
        self.assertTrue(hasattr(analyzer, 'rules'))
class IAPerformanceTest(TestCase):
    def test_model_initialization_performance(self):
        start = time.time()
        assistant = SecurityAIAssistant()
        duration = time.time() - start
        print(f"Temps d'initialisation du modèle IA : {duration:.2f} secondes")
        self.assertLess(duration, 5, "L'initialisation du modèle IA est trop lente")


class NotificationSecurityAPITests(TestCase):
    def test_unauthorized_access_notifications(self):
        response = self.client.get('/notifications/')  # adapte l’URL si besoin
        self.assertIn(response.status_code, [401, 403], "L'accès non autorisé doit être refusé")

