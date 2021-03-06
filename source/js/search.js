function isBlank(str) {
  return (!str || /^\s*$/.test(str));
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

function FusionProxy(fusion_id, apiKey){
  this.fusion_id = fusion_id;
  this.apiKey = apiKey;
  this.getData = function(callback){
    var that = this;
    ftToJSON('SELECT * FROM ' + this.fusion_id, this.apiKey, function(results){
      callback(that.formatter(results));
    });
  };
  this.formatter = function(results){
    var that = this;
    this.data = _.map(results, function(result){
      var lat = result.geo.split(", ")[0];
      var lng = result.geo.split(", ")[1];
      return {
        name:              result["Organismo"],
        address:           result["Dirección postal"],
        city:              result["Localidad"],
        phone:             result["Teléfono"],
        email:             result["email"],
        web:               result["web"],
        state:             result["Localidad"],
        service_days:      result["Días de atención"],
        service_hours:     result["Horarios"],
        services_provided: that.formatServices(result),
        icon:              that.iconSelector(result),
        latLng:            new google.maps.LatLng(lat, lng),
        latitude:          lat,
        longitude:         lng
      }
    });
    return this.data;
  };
  this.formatServices = function(result){
    if(isBlank(result["Servicio 2"])){
      return result["Servicio 1"];
    } else {
      return result["Servicio 1"] + ", " + result["Servicio 2"];
    }
  };
  this.iconSelector = function(organization){
    if (organization["Servicio 1"].length > 0 && organization["Servicio 2"].length > 0){
      return "img/expert.png";
    } else if (organization["Servicio 1"] == "Patrocinio jurídico"){
      return "img/court.png";
    } else if (organization["Servicio 1"] =="Asesoramiento"){
      return "img/group.png";
    } else if (organization["Servicio 1"] == "Atención psicológica"){
      return "img/communitycentre.png";
    } else {
      return "img/expert.png"
    }
  };
}

function Mapper(selector) {
  this.lastInfoWindow = null;
  this.selector = selector;
  this.mapOrganizations = [];
  this.init = function(){
    this.map = new google.maps.Map(document.getElementById(this.selector), {
      center: new google.maps.LatLng(-33.65682940830173, -63.85107421875),
      zoom: 5,
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
  this.addOrganizations = function(organizations){
    var that = this;
    this.mapOrganizations = _.map(organizations, function(organization){
      return new MapOrganization(organization, that);
    });
  };
  this.drawOrganizations = function(){
    var that = this;
    _.each(this.mapOrganizations, function(mapOrganization){
      mapOrganization.drawOn(that.map);
    });
  };
  this.addMarker = function(position, text){
    var marker = new google.maps.Marker({
        position: position,
        map: this.map,
        animation: google.maps.Animation.DROP,
        title: text 
    });
  };
  this.centerMap = function(location, zoom) {
    zoom = typeof zoom !== 'undefined' ? zoom : 15;
    this.map.setCenter(location);
    this.map.setZoom(zoom);
    return this;
  };
}

function MapOrganization(organization, mapper){
  this.organization = organization;
  this.mapper = mapper;
  this.infowindowTemplate = _.template($("#infowindowTemplate").html());
};
MapOrganization.prototype.addInfowindow = function(map){
  var that = this;
  var infowindow =  new google.maps.InfoWindow({
    content: Mustache.render(markers.template, organization),
    maxWidth: 300
  });
  google.maps.event.addListener(marker, 'click', function() {
    if (lastInfowindow) lastInfowindow.close();
    infowindow.open(map, marker);
    lastInfowindow = infowindow;
    $("#results").html(Mustache.render(markers.moreInfoTemplate, organization));
  });
};
MapOrganization.prototype.generateMarker = function(map){
  this.marker = new google.maps.Marker({
      position: this.organization.latLng,
      map: map,
      animation: google.maps.Animation.DROP,
      title: this.organization.title,
      icon: this.organization.icon
  });
};
MapOrganization.prototype.generateInfowindow = function(map){
  var that = this;
  this.infoWindow = new google.maps.InfoWindow({
    content: this.infowindowTemplate(this.organization),
    maxWidth: 300
  });
  google.maps.event.addListener(this.marker, 'click', function() {
    if (that.mapper.lastInfoWindow) that.mapper.lastInfoWindow.close();
    that.infoWindow.open(map, that.marker);
    that.mapper.lastInfoWindow = that.infoWindow;
  });
};
MapOrganization.prototype.drawOn = function(map){
  this.generateMarker(map);
  this.generateInfowindow(map);
};

function Searcher(map){
  this.map = map;
  this.template = _.template($("#resultsTemplate").html());
  this.resultsBox = $("#results");
  this.geocoder = new google.maps.Geocoder();
  this.search = function(cad){
    var reg_q = new RegExp(cad, "i");
    var that = this;
    this.geocoder.geocode({ 'address': cad + ", Argentina" }, function(results, status){
      that.geocoderSearch(results, status);
    });
    this.results = _.filter(this.organizations, function(organization){
      return (organization.name.search(reg_q) !== -1)
          || (organization.address.search(reg_q) !== -1)
          || (organization.services_provided.search(reg_q) !== -1)
    });
    this.results = _.uniq(this.results);
  };
  this.geocoderSearch = function(results, status){
    switch(results.length){
      case 0:
        break;
      case 1:
        this.results.reverse();
        this.results.push({
          partial: "address",
          address: results[0].formatted_address,
          latitude: results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng()
        });
        this.results.reverse();
        break;
      default:
        this.results = this.results.concat(
          _.map(results, function(result){
            return {
              partial: "address",
              address: result.formatted_address,
              latitude: result.geometry.location.lat(),
              longitude: result.geometry.location.lng()
            };
          })
        );
    }
    this.drawResults();
  };
  this.drawResults = function(){
    this.resultsBox.html(this.template({ results: this.results }));
  }
};

$(document).ready(function(){
  var mapper = new Mapper("map_canvas");
  var fusionProxy = new FusionProxy(
    $("#fusion-information").data("fusion"),
    $("#fusion-information").data("api")
  );
  var geoLocalizator = new GeoLocalizator();
  searcher = new Searcher(mapper);

  mapper.init();
  fusionProxy.getData(function(organizations){
    mapper.addOrganizations(organizations);
    mapper.drawOrganizations();
    searcher.organizations = organizations;
  });
  geoLocalizator.currentPosition(function(position){
    mapper.centerMap(position);
    mapper.addMarker(position, "Ud. está aquí.");
  });

  $("#btnSearch").click(function(event){
    event.preventDefault();
    searcher.exec($('#inputSearch').val());
  });
  $('#inputSearch').keypress(function(event){
    var cad = $(this).val();
    if(!isBlank(cad) && cad.length > 3){
      searcher.search(cad);
    }
  });
  $("a.organization_point").live("click", function(event){
    event.preventDefault();
    var $this = $(this);
    var newCenter = new google.maps.LatLng($this.data("latitude"), $this.data("longitude"));
    mapper.centerMap(newCenter);
  });
});
