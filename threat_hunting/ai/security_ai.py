import os
import yaml
import yara
from pathlib import Path
from typing import Dict, List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class SecurityAIAssistant:
    def __init__(self):
        self.model_name = "microsoft/CodeGPT-small-py"  # Modèle adapté au code et règles de sécurité
        self.device = "cuda" if hasattr(torch, "cuda") and torch.cuda.is_available() else "cpu"
        self.load_models()
        self.load_knowledge_base()
        
    def load_models(self):
        """Charge les modèles de langage"""
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            pad_token_id=self.tokenizer.eos_token_id
        ).to(self.device)
        
    def load_knowledge_base(self):
        """Charge la base de connaissances en sécurité"""
        self.yara_rules = self._load_yara_rules()
        self.sigma_rules = self._load_sigma_rules()
        self.threat_intel = self._load_threat_intel()
        
    def _load_yara_rules(self) -> Dict:
        """Charge les règles YARA depuis le répertoire"""
        yara_rules = {}
        rules_dir = Path(__file__).parent / "knowledge" / "yara_rules"
        
        for rule_file in rules_dir.glob("*.yar"):
            try:
                rules = yara.compile(filepath=str(rule_file))
                yara_rules[rule_file.stem] = rules
            except Exception as e:
                print(f"Erreur lors du chargement de la règle YARA {rule_file}: {e}")
                
        return yara_rules
        
    def _load_sigma_rules(self) -> Dict:
        """Charge les règles Sigma depuis le répertoire"""
        sigma_rules = {}
        rules_dir = Path(__file__).parent / "knowledge" / "sigma_rules"
        
        for rule_file in rules_dir.glob("*.yml"):
            try:
                with open(rule_file, 'r', encoding='utf-8') as f:
                    sigma_rules[rule_file.stem] = yaml.safe_load(f)
            except Exception as e:
                print(f"Erreur lors du chargement de la règle Sigma {rule_file}: {e}")
                
        return sigma_rules
        
    def _load_threat_intel(self) -> Dict:
        """Charge les données de renseignements sur les menaces"""
        intel = {}
        intel_dir = Path(__file__).parent / "knowledge" / "threat_intel"
        
        for intel_file in intel_dir.glob("*.yaml"):
            try:
                with open(intel_file, 'r', encoding='utf-8') as f:
                    intel.update(yaml.safe_load(f))
            except Exception as e:
                print(f"Erreur lors du chargement des données de menaces {intel_file}: {e}")
                
        return intel
    
    def analyze_yara_rule(self, rule_content: str) -> Dict:
        """Analyse une règle YARA"""
        try:
            # Vérification de la syntaxe
            yara.compile(source=rule_content)
            return {"status": "success", "message": "La règle YARA est syntaxiquement valide."}
        except yara.SyntaxError as e:
            return {"status": "error", "message": f"Erreur de syntaxe YARA: {str(e)}"}
    
    def generate_yara_rule(self, description: str) -> str:
        """Génère une règle YARA à partir d'une description"""
        prompt = f"Crée une règle YARA pour détecter: {description}\n\nrule Detect_Threat {{\n    meta:\n        author = \"SecurityAI\"\n        description = \"{description}\"\n    \n    strings:\n        $ = \""
        
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt").to(self.device)
        output = self.model.generate(
            input_ids,
            max_length=200,
            temperature=0.7,
            num_return_sequences=1,
            pad_token_id=self.tokenizer.eos_token_id
        )
        
        generated_rule = self.tokenizer.decode(output[0], skip_special_tokens=True)
        return generated_rule.split("rule Detect_Threat")[1].strip()
    
    def analyze_sigma_rule(self, rule_content: str) -> Dict:
        """Analyse une règle Sigma"""
        try:
            # Validation de base de la règle Sigma
            yaml.safe_load(rule_content)
            return {"status": "success", "message": "La règle Sigma est syntaxiquement valide."}
        except yaml.YAMLError as e:
            return {"status": "error", "message": f"Erreur de syntaxe YAML: {str(e)}"}
    
    def search_threat_intel(self, query: str) -> List[Dict]:
        """Recherche dans la base de connaissances sur les menaces"""
        query = query.lower()
        results = []
        
        for threat_id, threat_data in self.threat_intel.items():
            if (query in threat_data.get("title", "").lower() or 
                query in threat_data.get("description", "").lower() or
                any(query in tag.lower() for tag in threat_data.get("tags", []))):
                results.append(threat_data)
                
        return results

# Instance globale de l'assistant
security_assistant = SecurityAIAssistant()