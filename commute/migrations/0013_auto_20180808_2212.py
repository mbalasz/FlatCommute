# Generated by Django 2.0.7 on 2018-08-08 22:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commute', '0012_distance_commute_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='route',
            name='return_place_type',
            field=models.IntegerField(choices=[(1, 'Current flat'), (0, 'Custom place')], default=1, max_length=15),
        ),
        migrations.AlterField(
            model_name='route',
            name='start_place_type',
            field=models.IntegerField(choices=[(1, 'Current flat'), (0, 'Custom place')], default=1, max_length=15),
        ),
    ]
