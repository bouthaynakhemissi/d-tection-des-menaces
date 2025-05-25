import os
import sys
import logging
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Activez les logs détaillés
logging.basicConfig(level=logging.DEBUG)

from threat_hunting.ai.sigma_analyzer import SigmaAnalyzer

def test_sigma_analyzer():
    # Création de l'analyseur
    analyzer = SigmaAnalyzer()
    
    # Test avec un log qui correspond exactement à la règle
    test_logs = [{
        "EventID": "4688",
        "NewProcessName": "powershell.exe",  # Simplifié pour la correspondance
        "CommandLine": "powershell -nop -w hidden -c test"
    }]
    
    # Afficher les règles chargées
    print("\n=== Règles chargées ===")
    for i, rule in enumerate(analyzer.rules, 1):
        print(f"\nRègle {i}: {rule.get('title')}")
        print(f"Condition: {rule.get('detection', {}).get('selection')}")
    
    # Analyse des logs
    print("\n=== Début du test ===")
    results = analyzer.analyze_logs(test_logs)
    
    # Affichage des résultats
    print("\n=== Résultats du test ===")
    if results:
        for result in results:
            print(f"\n[ALERTE] {result['severity']}: {result['title']}")
            print(f"Description: {result['description']}")
            print("Détails du log:", result['log_entry'])
    else:
        print("Aucune correspondance trouvée.")
        print("\nDétails du log testé:")
        print(test_logs[0])

if __name__ == "__main__":
    test_sigma_analyzer()