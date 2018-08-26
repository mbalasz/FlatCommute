# Generated by Django 2.1 on 2018-08-19 22:51

import datetime
from django.db import migrations, models
import django.db.models.deletion
import multiselectfield.db.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Distance',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.DurationField(default=datetime.timedelta(0))),
                ('commute_type', models.CharField(choices=[('cycle', 'Cycling'), ('transit', 'Transit')], default='transit', max_length=15)),
                ('destination', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='distances_with_destination', to='commute.Address')),
                ('origin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='distances_with_origin', to='commute.Address')),
            ],
        ),
        migrations.CreateModel(
            name='Flat',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='commute.Address')),
            ],
        ),
        migrations.CreateModel(
            name='Place',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('address', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='commute.Address')),
            ],
        ),
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_place_type', models.IntegerField(choices=[(1, 'Current flat'), (0, 'Custom place')], default=1)),
                ('return_place_type', models.IntegerField(choices=[(1, 'Current flat'), (0, 'Custom place')], default=1)),
                ('day', multiselectfield.db.fields.MultiSelectField(choices=[('mon', 'Monday'), ('tue', 'Tuesday'), ('wed', 'Wednesday'), ('thu', 'Thursday'), ('fri', 'Friday'), ('sat', 'Saturday'), ('sun', 'Sunday')], default=None, max_length=27)),
                ('start_time', models.TimeField(blank=True, null=True)),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('destination_place', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='routes_with_this_destination', to='commute.Place')),
                ('return_place_custom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='routes_ending_here', to='commute.Place')),
                ('start_place_custom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='routes_starting_here', to='commute.Place')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=15)),
                ('flats', models.ManyToManyField(to='commute.Flat')),
                ('selected_flat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='users_with_flat_selected', to='commute.Flat')),
            ],
        ),
        migrations.AddField(
            model_name='route',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='commute.User'),
        ),
        migrations.AddField(
            model_name='place',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='places_associated', to='commute.User'),
        ),
    ]
