# Generated by Django 5.2 on 2025-05-06 14:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_regle'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rapport',
            name='date_debut',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='rapport',
            name='date_fin',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='rapport',
            name='statut',
            field=models.CharField(choices=[('BROUILLON', 'Brouillon'), ('EN_COURS', 'En cours'), ('TERMINE', 'Terminé')], default='BROUILLON', max_length=20),
        ),
    ]
