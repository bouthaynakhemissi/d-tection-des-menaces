# Generated by Django 5.2 on 2025-05-23 08:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_alter_rapport_createur_resultatanalyse_correlation'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='rapport',
            name='fichier_rapport',
        ),
    ]
