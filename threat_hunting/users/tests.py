# threat_hunting/ai/tests.py
from django.test import TestCase
from threat_hunting.ai.sigma_analyzer import SigmaAnalyzer
class SigmaAnalyzerTestCase(TestCase):
    def test_sigma_analyzer_initialization(self):
        analyzer = SigmaAnalyzer()
        self.assertIsNotNone(analyzer)
