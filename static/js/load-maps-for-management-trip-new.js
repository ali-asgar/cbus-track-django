$(function() {

    var bus_id;
    var date = parseDate(new Date());
    var morn_even=0;
    var lat,lon;
    var map,marker,currentCenter,currentPath;

    var coord_array = new Array();

    var i=0;
    var hidden = true;



    $('#dp1').datepicker({
        format: 'dd-mm-yyyy',
        todayBtn: 'linked'
    })
        .on('changeDate', function(ev){
            date = parseDate(ev.date);
            console.log(ev);
            console.log("Date picked : " + ev.date);
        });
    $('#dp1').datepicker('update', date);

    // Initialization Code for Google Maps
    function initialize()
    {
        currentCenter = coord_array[i-1];
        var mapProp = {
            center: currentCenter,
            zoom:15,
            mapTypeId:google.maps.MapTypeId.ROADMAP
        };
        map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

        marker=new google.maps.Marker({
            position: currentCenter,
            animation:google.maps.Animation.BOUNCE,
            icon:'/static/img/bus_position_marker.png',
        });
        marker.setMap(map);

        currentPath=new google.maps.Polyline({
            path:coord_array,
            strokeColor:"#0000FF",
            strokeOpacity:0.8,
            strokeWeight:2
        });

        currentPath.setMap(map);
        done_loading();
    }
    function setMarker(pos) {
        currentPath.setPath(coord_array);
        map.setCenter(pos);
        marker.setPosition(pos);
    }

    function get_some_default_values() {
        // Fills the table during the first run.
        //Gets around 50 last values from the table.


        bus_id=$("#bus").val();
        morn_even=$("#time").val();

        $.ajax({
            dataType: "json",
            url: "/ajax/trip/"+bus_id+"/"+date+"/"+morn_even,
            success: function(data) {
                console.log("Data from the Previous coordinates...");

                data = data.reverse();
                //console.log(data);

                $(".stats-table-body").html("");
                coord_array = [];
                i=0;
                var dist = 0.0;
                var lastlat,lastlon;
                var maxspeed=0.0;
                var initial_time;
                if ( data[0] !== undefined )
                    initial_time = data[0].time;
                time = initial_time;

                $.each(data, function(key,value) {

                    var data=value;

                    lat = data.lat;
                    lon = data.lon;
                    speed = data.speed;
                    time = data.time;
                    //console.log("CHECKING.. SPEED="+speed+" and maxspeed="+maxspeed);
                    if(parseFloat(maxspeed)<parseFloat(speed))
                    {
                        maxspeed=speed;
                        //console.log("MAXSPEED="+maxspeed);
                    }

                    if(lat === undefined || lon === undefined || lastlat === undefined || lastlon === undefined ) {	}
                    else {
                        var val=computedisplacement(lat, lon, lastlat, lastlon);

                        if(isNaN(val)) val = 0;

                        dist=parseFloat(dist)+parseFloat(val);

                        if( isNaN(val)  || dist === isNaN(undefined))
                            console.log("Distance : " + dist + "  Val : " + val + "   Comparing - " + lat + " " + lon + " " + lastlat + " " + lastlon);

                    }
                    lastlat=lat;
                    lastlon=lon;

                    var pos = new google.maps.LatLng(lat,lon);
                    coord_array[i++] = pos;

                    append_table(lat,lon,time,"last-trip",speed);

                });

                var final_time = time;

                console.log(coord_array);
                console.log("distance="+dist);
                console.log("MAX SPEED="+maxspeed);
                if( final_time !== undefined || initial_time !== undefined )
                    updateMiniStats(dist, getTravelTime(initial_time, final_time),maxspeed);


                $('#reloadButton').removeClass("disabled");
                console.log("after the asynchronous ajax call...");
                initialize();
            }
        });
    }
    function pad2(number) {

        return (number < 10 ? '0' : '') + number
    }
    window.reload = function () {
        hidden = true;
        $(".progress-ring").show();
        $(".progress-ring").removeClass("hidden");
        $('#reloadButton').addClass("disabled");
        get_some_default_values();

    }
    reload();

    // Called after the maps is loaded...
    // Shows the table, and hides the loading bar.

    function done_loading() {
        if(hidden) {
            $(".progress-ring").addClass("hidden");
            $(".stats-table").show();
            hidden = false;

        }
    }
    //displacement function for co ordinates
    function computedisplacement(lat1,lon1,lat2,lon2) {
        var theta=lon1-lon2;
        var dist= Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
        dist = Math.acos(dist);
        dist = rad2deg(dist);
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
    function deg2rad(deg) {
        return (deg * Math.PI / 180.0);
    }
    function rad2deg(rad) {
        return (rad * 180.0 / Math.PI);
    }

    function parseDate(date) {
        return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    }
    function getTravelTime(initial, final) {
        var d1 = Date.parse(initial);
        var d2 = Date.parse(final);
        var diff = d2 - d1;
        var minutes = parseInt(diff/1000/60);
        var hours = parseInt(minutes/60);
        minutes = minutes % 60;
        return hours + " hrs " + minutes + " mins"


    }
    function updateMiniStats(distance, time,maxspeed) {
        var to_append = "<tr><th style='width:25%;'>Distance</th><td>"+ distance.toFixed(3) +" KM</td></tr>";
        to_append += "<tr><th>Time</th><td>"+ time +"</td></tr>";
        to_append += "<tr><th>Maximum Speed</th><td>"+ maxspeed +" km/hr</td></tr>";
        $(".mini-stats-body").html(to_append);
    }
    function updateMornEvenStats(route,date,morneven,distance, time,maxspeed) {

        var to_append="<tr>"
        to_append+="<td>"+route+"</td>";
        to_append+="<td>"+date+"</td>";
        to_append+="<td>"+morneven+"</td>";
        to_append+="<td>"+distance.toFixed(3)+"</td>";
        to_append+="<td>"+time+"</td>";
        to_append+="<td>"+maxspeed+"</td>";
        to_append+="</tr>";
        $(".stats-table-body-morn-even").append(to_append);
    }
});
