# Generated by Django 5.2 on 2025-05-23 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_remove_rapport_fichier_rapport'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='recipient',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
