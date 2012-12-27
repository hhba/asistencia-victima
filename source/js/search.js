var fustion_table_id = '1xxoIwan9TAwkh_AMkmfYQKbyUdQAvbR5WTvtgzw';
var map;
var mapper;
var fusionProxy;
var layerl0;
var styles = [];
var lastInfowindow = null;
var defaultZoom = 5;

function FusionProxy(fusion_id){
  this.fusion_id = fusion_id;
  this.getData = function(callback){
    var that = this;
    ft2json.query('SELECT * FROM ' + this.fusion_id, function(results){
      callback(that.formatter(results));
    });
  };
  this.formatter = function(results){
    var that = this;
    this.data = _.map(results.data, function(result){
      var lat = result.geo.split(", ")[0];
      var lng = result.geo.split(", ")[1];
      return {
        name:    result["Organismo"],
        address: result["Dirección postal"],
        city:    result["Localidad"],
        phone:   result["Teléfono"],
        email:   result["email"],
        web:     result["web"],
        icon:    that.iconSelector(result),
        latLng: new google.maps.LatLng(lat, lng)
      }
    });
    return this.data;
  };
  this.iconSelector = function(organization){
    console.log(organization);
    return "expert.png";
  };
}

function Mapper(selector) {
  this.selector = selector;
  this.markers = [];
  this.init = function(){
    this.map = new google.maps.Map(document.getElementById(this.selector), {
      center: new google.maps.LatLng(-33.65682940830173, -63.85107421875),
      zoom: defaultZoom
    });
    return this.styleMap();
  };
  this.styleMap = function(){
    var style = [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          { saturation: -90 }
        ]
      }
    ];
    var styledMapType = new google.maps.StyledMapType(style, {
      map: this.map,
      name: 'Styled Map'
    });
    this.map.mapTypes.set('map-style', styledMapType);
    this.map.setMapTypeId('map-style');
    return this;
  };
  this.addMarkers = function(organizations){
    var that = this;
    this.markers = _.map(organizations, function(organization){
      var marker = new google.maps.Marker({
        position: organization.latLng,
        map: that.map,
        animation: google.maps.Animation.DROP,
        title: organization.name,
        icon: organization.icon,
        //organization: organization
      });
    });
  };
  this.addMarker = function(position, text){
    var marker = new google.maps.Marker({
        position: position,
        map: this.map,
        animation: google.maps.Animation.DROP,
        title: text 
    });
    return marker;
  };
  this.centerMap = function(location, zoom) {
    zoom = typeof zoom !== 'undefined' ? zoom : 15;
    this.map.setCenter(location);
    this.map.setZoom(zoom);
    return this;
  };
}

function GeoLocalizator() {
  this.currentPosition = function(callback){
    var that = this;
    this.callback = callback;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function(position){
          var newCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude, {timeout: 5000});
          that.callback(newCenter);
        }, function(){
          that.errorHandler();
        }
      );
    }
  };
  this.errorHandler = function(msg){
  };
}

function Marker(position){
  this.position = position;
}

var Markers = {
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
          $("#results").html(Mustache.render(markers.moreInfoTemplate, organization));
        });
      }
    });
  }
};

$(document).ready(function(){
  mapper = new Mapper("map_canvas");
  fusionProxy = new FusionProxy($("#fusion-information").data("fusion"));
  geoLocalizator = new GeoLocalizator();
  mapper.init();
  fusionProxy.getData(function(results){
    mapper.addMarkers(results);
  });
  geoLocalizator.currentPosition(function(position){
    mapper.centerMap(position);
    mapper.addMarker(position, "You are here");
  });

//  initialize();
//  searcher.initialize(map);
  $("#btnSearch").click(function(event){
    event.preventDefault();
    searcher.exec($('#inputSearch').val());
  });
  $('#inputSearch').change(function(event){
    event.preventDefault();
    var cad = $(this).val();
    if(cad.length > 1){
      searcher.exec(cad);
    }
  });
  $("a.organization").live("click", function(event){
    event.preventDefault();
    var $this = $(this);
    newCenter = new google.maps.LatLng($this.data("latitude"), $this.data("longitude"));
    map.setCenter(newCenter);
  });
});
