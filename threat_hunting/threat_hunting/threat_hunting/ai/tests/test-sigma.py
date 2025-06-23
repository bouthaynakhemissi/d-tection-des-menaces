# threat_hunting/ai/tests/test-sigma.py
from django.test import TestCase
from ..sigma_analyzer import SigmaAnalyzer

class SigmaAnalyzerTest(TestCase):
    def test_analyzer_initialization(self):
        """Vérifie que l'analyseur se charge correctement"""
        analyzer = SigmaAnalyzer()
        self.assertIsNotNone(analyzer)
        self.assertTrue(hasattr(analyzer, 'rules'))