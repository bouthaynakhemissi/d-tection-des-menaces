import sys
if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Notification(models.Model):
    NOTIF_TYPES = (
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('WEB', 'Web'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notif_type = models.CharField(max_length=10, choices=NOTIF_TYPES)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    recipient = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username}-{self.notif_type}-{self.message}-{self.created_at}"


class Rapport(models.Model):
    TYPE_RAPPORT_CHOICES = (
        ('INCIDENT', 'Rapport d\'Incident'),
        ('SECURITE', 'Rapport de Sécurité'),
        ('AUDIT', 'Rapport d\'Audit'),
    )
    STATUT_CHOICES = [
        ('BROUILLON', 'Brouillon'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé')
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField()
    type_rapport = models.CharField(max_length=20, choices=TYPE_RAPPORT_CHOICES)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='BROUILLON')
    createur = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_creation']
        
    def __str__(self):
        return f"{self.titre} - {self.get_type_rapport_display()}"

class Regle(models.Model):
    TYPE_CHOICES = [
        ('YARA', 'YARA'),
        ('SIGMA', 'SIGMA')
    ]
    
    nom = models.CharField(max_length=200)
    type = models.CharField(max_length=5, choices=TYPE_CHOICES)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.nom} ({self.type})"

class ResultatAnalyse(models.Model):
    TYPE_ANALYSE_CHOICES = [
        ('YARA', 'Analyse YARA'),
        ('SIGMA', 'Règle SIGMA'),
        ('CORRELATION', 'Corrélation')
    ]
    
    SEVERITE_CHOICES = [
        ('LOW', 'Faible'),
        ('MEDIUM', 'Moyenne'),
        ('HIGH', 'Haute'),
        ('CRITICAL', 'Critique')
    ]
    
    type_analyse = models.CharField(max_length=20, choices=TYPE_ANALYSE_CHOICES)
    regle = models.ForeignKey(Regle, on_delete=models.CASCADE, null=True, blank=True)
    fichier_analyse = models.CharField(max_length=255, null=True, blank=True)
    resultat = models.JSONField()
    date_analyse = models.DateTimeField(auto_now_add=True)
    severite = models.CharField(max_length=10, choices=SEVERITE_CHOICES, default='MEDIUM')
    rapport = models.ForeignKey(Rapport, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-date_analyse']
    
    def __str__(self):
        return f"{self.get_type_analyse_display()} - {self.date_analyse}"

class Correlation(models.Model):
    resultats = models.ManyToManyField(ResultatAnalyse, related_name='correlations')
    description = models.TextField()
    score_confiance = models.FloatField(default=0.0)
    date_creation = models.DateTimeField(auto_now_add=True)
    menace = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        ordering = ['-score_confiance', '-date_creation']
    
    def __str__(self):
        return f"Correlation {self.id} - {self.menace or 'Menace inconnue'}"

class Machine(models.Model):
    ip_address = models.GenericIPAddressField(unique=True)
    hostname = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.ip_address