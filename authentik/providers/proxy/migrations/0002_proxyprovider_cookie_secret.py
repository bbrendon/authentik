# Generated by Django 3.1 on 2020-08-19 14:50

from django.db import migrations, models

import authentik.providers.proxy.models


class Migration(migrations.Migration):

    dependencies = [
        ("authentik_providers_proxy", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="proxyprovider",
            name="cookie_secret",
            field=models.TextField(default=authentik.providers.proxy.models.get_cookie_secret),
        ),
    ]
