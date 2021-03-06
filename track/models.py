# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.

from django.db import models
# import datetime

class RouteDetail(models.Model):
    number = models.CharField(max_length=150)

    def __unicode__(self):
        return "%s" % ( self.number)

class Balance(models.Model):
    bus = models.ForeignKey(RouteDetail)
    time = models.DateTimeField(auto_now_add=True)
    balance = models.CharField(max_length=150)

    def __unicode__(self):
        return "%s %s %s" % (self.bus, self.balance, self.time)

    class Meta:
        verbose_name="SIM Balance"
        verbose_name_plural="SIM Balance"

class BusStop(models.Model):
    bus = models.ForeignKey(RouteDetail)
    lat = models.CharField(max_length=90)
    lon = models.CharField(max_length=90)
    name = models.CharField(max_length=150)

    def __unicode__(self):
        return "%s" % (self.name)

class User(models.Model):
    stop = models.ForeignKey(BusStop, blank=True, null=True)
    name = models.CharField(max_length=200)
    gcm = models.CharField(max_length=200, blank=True, null=True, unique=True)
    notify = models.BooleanField(default=True)
    min_distance = models.CharField(max_length=10, default="2")
    min_time = models.CharField(max_length=10, default="5")
    last_update_time = models.DateTimeField(default='2012-01-01 01:00')

    def __unicode__(self):
        return "%s@%s" % (self.name, self.stop)

class BusTravelLogManager(models.Manager):
    def get_last_trip(self, bus, limit, return_as_object=False):
        from track.last_trip import my_calc_func
        return my_calc_func(bus, limit, return_as_object)

class BusTravelLog(models.Model):
    bus = models.ForeignKey(RouteDetail)
    lat = models.CharField(max_length=90)
    lon = models.CharField(max_length=90)
    valid = models.CharField(max_length=30, default="YES")
    speed = models.CharField(max_length=150)
    time = models.DateTimeField(auto_now_add = True)
    objects = BusTravelLogManager()

    def __unicode__(self):
        return "%s %s %s" % (self.lat, self.lon, self.time)
