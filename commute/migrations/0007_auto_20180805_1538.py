# Generated by Django 2.0.7 on 2018-08-05 15:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('commute', '0006_direction'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Direction',
            new_name='Distance',
        ),
    ]
