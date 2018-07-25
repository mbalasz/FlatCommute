# Generated by Django 2.0.7 on 2018-07-25 01:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('address', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Day',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
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
                ('address', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='commute.Address')),
            ],
        ),
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_place_type', models.CharField(choices=[('CURRENT_FLAT', 'Current flat'), ('CUSTOM', 'Custom place')], default='CURRENT_FLAT', max_length=15)),
                ('return_place_type', models.CharField(choices=[('CURRENT_FLAT', 'Current flat'), ('CUSTOM', 'Custom place')], default='CURRENT_FLAT', max_length=15)),
                ('start_time', models.TimeField(blank=True, null=True)),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='commute.Day')),
                ('destination_place', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='routes_with_this_destination', to='commute.Place')),
                ('return_place_custom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='routes_ending_here', to='commute.Place')),
                ('start_place_custom', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='routes_starting_here', to='commute.Place')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
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
