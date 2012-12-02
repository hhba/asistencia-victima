var fustion_table_id = '1xxoIwan9TAwkh_AMkmfYQKbyUdQAvbR5WTvtgzw';
var map;
var layerl0;
var styles = [];
var lastInfowindow = null;
var markers = {
  getData: function(){
   this.organizations = $("#marker-information").data("organizations");
  },
  drawOn: function(map){
    this.template = $("#infowindowTemplate").html();
    this.moreInfoTemplate = $("#moreInfoTemplate").html();
    this.getData();
    $.each(this.organizations, function(index, organization){
      var address = organization.addresses[0];
      if(address){
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(address.latitude, address.longitude),
          map: map,
          animation: google.maps.Animation.DROP,
          title: organization.name,
          icon: organization.icon,
          organization: organization
        });
        var infowindow = new google.maps.InfoWindow({
          content: Mustache.render(markers.template, organization),
          maxWidth: 300
        });
        google.maps.event.addListener(marker, 'click', function() {
          if (lastInfowindow) lastInfowindow.close();
          infowindow.open(map, marker);
          lastInfowindow = infowindow;
          $("#guia").html(Mustache.render(markers.moreInfoTemplate, organization));
        });
      }
    });
  }
};
var geoLocalizator = {
  success: function(position){
    newCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map.setCenter(newCenter);
    var marker = new google.maps.Marker({
        position: newCenter,
        map: map,
        animation: google.maps.Animation.DROP,
        title: "Tu ubicación actual"
    });
  },
  error: function(msg){
    // console.log(msg);
  },
  centerMap: function(map){
    this.map = map;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.success, this.error);
    }
  }
};

function initialize() {
  map = new google.maps.Map(document.getElementById('map_canvas'), {
    center: new google.maps.LatLng(-33.65682940830173, -63.85107421875),
    zoom: 15
  });
  geoLocalizator.centerMap(map);
  var style = [
    {
      featureType: 'all',
      elementType: 'all',
      stylers: [
        { saturation: -99 }
      ]
    }
  ];
  var styledMapType = new google.maps.StyledMapType(style, {
    map: map,
    name: 'Styled Map'
  });
  map.mapTypes.set('map-style', styledMapType);
  map.setMapTypeId('map-style');
  // layerl0 = new google.maps.FusionTablesLayer({
  //   query: {
  //     select: "Dirección maps",
  //     from: fustion_table_id
  //   },
  //   map: map,
  //   styleId: 2
  // });
  markers.drawOn(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
