# Generated by Django 2.0.7 on 2018-07-25 01:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commute', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='name',
            field=models.CharField(default='default', max_length=15),
            preserve_default=False,
        ),
    ]
