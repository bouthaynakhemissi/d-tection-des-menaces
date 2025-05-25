import yara
import os

class YARAAnalyzer:
    def __init__(self, rules_path):
        self.rules_path = rules_path
        self.rules = None
        self.compile_rules()

    def compile_rules(self):
        try:
            self.rules = yara.compile(filepath=self.rules_path)
        except yara.SyntaxError as e:
            raise Exception(f"Erreur dans la compilation des règles YARA: {str(e)}")

    def analyze_file(self, file_path):
        try:
            matches = self.rules.match(file_path)
            return [{
                'rule': match.rule,
                'tags': list(match.tags),
                'meta': match.meta,
                'strings': match.strings
            } for match in matches]
        except Exception as e:
            raise Exception(f"Erreur lors de l'analyse du fichier: {str(e)}")
