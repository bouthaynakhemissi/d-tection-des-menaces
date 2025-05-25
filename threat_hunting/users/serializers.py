from turtle import up, update
from rest_framework import serializers
from .models import Notification, Rapport, Regle, ResultatAnalyse, Correlation , Machine

ALLOWED_TYPES = ['YARA', 'SIGMA']

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Place-le ici !
    recipient = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user',)
        

class RapportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapport
        fields = '__all__'
        read_only_fields = ('date_creation', 'date_modification')
        extra_kwargs = {
            'statut': {'default': 'BROUILLON'},
            'createur': {'required': False}  # Rendre le champ optionnel
        }

    def validate(self, data):
        if data.get('date_debut') and data.get('date_fin'):
            if data['date_debut'] > data['date_fin']:
                raise serializers.ValidationError("La date de début ne peut pas être après la date de fin")
        return data


class RegleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regle
        fields = '__all__'
        read_only_fields = ('date_creation', 'date_modification')

    def validate(self, data):
        if not data.get('nom'):
            raise serializers.ValidationError("Le nom est obligatoire")
        if not data.get('contenu'):
            raise serializers.ValidationError("Le contenu est obligatoire")
        
        # Validation du type
        type_regle = data.get('type')
        if type_regle and type_regle not in ALLOWED_TYPES:
            raise serializers.ValidationError(f"Le type de règle doit être l'un des suivants: {', '.join(ALLOWED_TYPES)}")
        
        return data

class ResultatAnalyseSerializer(serializers.ModelSerializer):
    type_analyse_display = serializers.CharField(source='get_type_analyse_display', read_only=True)
    severite_display = serializers.CharField(source='get_severite_display', read_only=True)
    
    class Meta:
        model = ResultatAnalyse
        fields = '__all__'
        read_only_fields = ('date_analyse',)

class CorrelationSerializer(serializers.ModelSerializer):
    resultats = ResultatAnalyseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Correlation
        fields = '__all__'
        read_only_fields = ('date_creation', 'score_confiance')

    def create(self, validated_data):
        resultats_data = validated_data.pop('resultats', [])
        correlation = Correlation.objects.create(**validated_data)
        
        for resultat_data in resultats_data:
            resultat = ResultatAnalyse.objects.get_or_create(**resultat_data)[0]
            correlation.resultats.add(resultat)
            
        return correlation


class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = '__all__'