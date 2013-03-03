from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^ajax/', include('track.urls')),
)
urlpatterns += patterns('track.views',
	# for legacy code
	url(r'^php/log.php/$', 'php_add'),
	# for updating via git
	url(r'^deploy/$', 'deploy'),
	url(r'^$', 'stats'),
    url(r'^add/(?P<bus>\d+)/(?P<lat>(\d*[.])?\d+)/(?P<lon>(\d*[.])?\d+)/(?P<speed>(\d*[.])?\d+)/(?P<balance>[\d\w\.\$]+)/$', 'add'),
)
