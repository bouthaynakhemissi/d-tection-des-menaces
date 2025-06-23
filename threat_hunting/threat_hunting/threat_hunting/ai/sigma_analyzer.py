import yaml
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SigmaAnalyzer:
    """Classe pour analyser les logs système avec des règles SIGMA."""
    
    def __init__(self, rules_dir: str = None):
        """Initialise l'analyseur SIGMA."""
        self.rules_dir = Path(rules_dir) if rules_dir else Path(__file__).parent / 'sigma_rules'
        logger.info(f"Initialisation de l'analyseur SIGMA avec le répertoire : {self.rules_dir}")
        self.rules = self._load_rules()
        logger.info(f"Nombre de règles chargées : {len(self.rules)}")
    
    def _load_rules(self) -> List[Dict]:
        """Charge les règles SIGMA depuis le répertoire des règles."""
        rules = []
        logger.info(f"Chargement des règles depuis : {self.rules_dir}")
        
        if not self.rules_dir.exists():
            logger.error(f"ERREUR: Le répertoire n'existe pas : {self.rules_dir}")
            return rules
            
        yml_files = list(self.rules_dir.glob('**/*.yml'))
        logger.info(f"Fichiers YAML trouvés : {[str(f) for f in yml_files]}")
        
        for rule_file in yml_files:
            try:
                with open(rule_file, 'r', encoding='utf-8') as f:
                    rule = yaml.safe_load(f)
                    if rule and isinstance(rule, dict):
                        rule['file'] = str(rule_file)
                        rules.append(rule)
                        logger.debug(f"Règle chargée depuis {rule_file}: {rule.get('title')}")
            except Exception as e:
                logger.error(f"Erreur lors du chargement de la règle {rule_file}: {e}")
        
        return rules
    
    def analyze_logs(self, log_data: List[Dict], log_source: str = None) -> List[Dict]:
        """Analyse les logs avec les règles SIGMA chargées."""
        if not self.rules:
            logger.warning("Aucune règle n'a été chargée pour l'analyse")
            return []
            
        results = []
        logger.info(f"Début de l'analyse de {len(log_data)} entrées de log")
        
        for log_entry in log_data:
            logger.debug(f"\nAnalyse de l'entrée de log : {log_entry}")
            
            for rule in self.rules:
                if log_source and rule.get('logsource', {}).get('product') != log_source:
                    continue
                
                if self._matches_rule(log_entry, rule):
                    result = {
                        'rule_id': rule.get('id', 'N/A'),
                        'title': rule.get('title', 'Sans titre'),
                        'description': rule.get('description', ''),
                        'severity': rule.get('level', 'medium').upper(),
                        'log_entry': log_entry,
                        'rule_details': rule
                    }
                    logger.info(f"Correspondance trouvée avec la règle: {result['title']}")
                    results.append(result)
        
        logger.info(f"Analyse terminée. {len(results)} correspondances trouvées.")
        return results
    
    def _matches_rule(self, log_entry: Dict, rule: Dict) -> bool:
        """Vérifie si une entrée de log correspond à une règle SIGMA."""
        if 'detection' not in rule:
            logger.debug(f"Règle {rule.get('title')} ignorée - aucune section 'detection' trouvée")
            return False
            
        detection = rule['detection']
        
        # Vérification de la condition
        condition = detection.get('condition', 'selection')
        if ' or ' in condition.lower():
            parts = [p.strip() for p in condition.lower().split(' or ')]
            return any(self._check_condition(part, detection, log_entry) for part in parts)
        else:
            return self._check_condition(condition, detection, log_entry)
    
    def _check_condition(self, condition: str, detection: Dict, log_entry: Dict) -> bool:
        """Vérifie une condition individuelle."""
        if condition == 'selection':
            selection = detection.get('selection', {})
            return all(
                self._field_matches(log_entry.get(field), patterns)
                for field, patterns in selection.items()
                if field != 'condition'
            )
        return False
    def _field_matches(self, field_value: Any, patterns: Any) -> bool:
        """Vérifie si une valeur de champ correspond aux motifs donnés."""
        if field_value is None:
            return False
            
        field_str = str(field_value).lower()
        
        # Si patterns est un dictionnaire (pour les opérateurs)
        if isinstance(patterns, dict):
            for operator, value in patterns.items():
                if operator == 'contains':
                    if isinstance(value, list):
                        return any(str(v).lower() in field_str for v in value)
                    return str(value).lower() in field_str
                    
        # Si patterns est une liste
        elif isinstance(patterns, list):
            return any(self._field_matches(field_value, p) for p in patterns)
            
        # Si patterns est une chaîne simple avec caractères génériques
        pattern = str(patterns).lower()
        
        # Gestion des caractères génériques
        if '*' in pattern:
            import re
            # Échapper les autres caractères spéciaux de regex
            pattern = re.escape(pattern)
            # Remplacer \* (l'astérisque échappé) par .*
            pattern = pattern.replace('\\*', '.*')
            # Ajouter les ancres de début et de fin
            pattern = f'^{pattern}$'
            return bool(re.match(pattern, field_str))
        else:
            return pattern in field_str