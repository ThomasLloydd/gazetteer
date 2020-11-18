//Initialise vars
let geoPoly;
let $loading = $("#loadingDiv").hide();
let lat = 50;
let lng = 50;
let bounds;
let map;
let zoom = 5;
let markers = L.markerClusterGroup();
let country;
let countryCode;
let myBounds = [
  [-90, -180],
  [90, 180],
];
//Icon Styles
const earthquakeIcon = L.icon({
  iconUrl: "./libs/images/earthquake-icon.png",
  iconSize: [50, 50],
});
const weatherStationIcon = L.icon({
  iconUrl: "./libs/images/weather-station-icon.png",
  iconSize: [50, 50],
});

const cityIcon = L.icon({
  iconUrl: "./libs/images/city-marker.png",
  iconSize: [50, 50],
  zIndex: 10,
});
const wikiIcon = L.icon({
  iconUrl: "./libs/images/wiki-marker.png",
  iconSize: [50, 50],
  zIndex: 10,
});

const polyStyle = {
  color: "blue",
  weight: 2,
  opacity: 0.3,
};

// Map Styles:
const OpenTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    minZoom: 2,
    maxZoom: 16,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',

    bounds: myBounds,
  }
);

const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  minZoom: 2,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const CartoDB_DarkMatter = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    minZoom: 2,
    maxZoom: 20,

    bounds: myBounds,
  }
);

const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 12,
  minZoom: 2,
});
const baseMaps = {
  "Nat Geo World Map": Esri_NatGeoWorldMap,
  "Open Street Map": OpenStreetMap_Mapnik,
  "Open Todo": OpenTopoMap,
  "Dark Matter": CartoDB_DarkMatter,

};
const overlayMaps = {
  Markers: markers
};
//Initialise map
map = L.map("mapid").setView([lat, lng], zoom, {});
Esri_NatGeoWorldMap.addTo(map);


L.control.layers(baseMaps, overlayMaps).addTo(map);
map.setMaxBounds(myBounds);

//Populate Select Box
const populateSelect = () => {
  $.ajax({
    url: "libs/php/getCountryPoly.php",
    type: "POST",
    dataType: "json",
    data: {
      iso2: $("#dropdown").val(),
    },
    success: function (result) {
      result.countryFeatures.forEach((i) => {
        $("#dropdown").append(`<option value="${i[1]}">${i[0]}</option>`);
      });
    },
    error: function (error) {
      console.log(error);
    },
  });
};

//Gets rest country info then sets country info
const getRestCountries = (iso /*, capital*/) => {
  $.ajax({
    url: "libs/php/getRestCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      iso2: iso,
    },
    success: function (result) {
      markers.clearLayers();

      if (result.status.name == "ok") {
        setCountryInfo(result);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
};

//Gets weather & data & updates info
const getWeatherAndCurrency = (cap, curr) => {
  $.ajax({
    url: "libs/php/getWeatherAndCurrency.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCapital: cap,
      currency: curr,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        cityMarker = L.marker(
          [result.weatherCoords.lat, result.weatherCoords.lon],
          {
            icon: cityIcon,
          }
        );
        cityMarker.bindPopup(`<h5>${result.name}</h4>
                                  <p>Temp: ${result.main.temp}&#176;C</p> 
                                  <p>Feels like: ${result.main.feels_like}&#176;C</p>
                                  <p>Pressure: ${result.main.pressure}mb</p>
                                  <p>Humidity: ${result.main.humidity}%</p>`);
        markers.addLayer(cityMarker);
        $("#country-exchange").html(result.rate);
        $("#temp").html(`${result.main.temp}&#176;C`);
        $("#feels-like").html(`${result.main.feels_like}&#176;C`);
        $("#pressure").html(`${result.main.pressure}mb`);
        $("#humidity").html(`${result.main.humidity}%`);
        
        markers.addTo(map);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
};

//Sets country info & calls ajax functions with info
const setCountryInfo = (result) => {
  countryCode = result.countryCode;
  countryCur = result.currency;
  $("#country-region").html(result.region);
  $("#country-name").html(result.name);
  $("#currency").html(result.currency);
  $("#country-flag").attr("src", result.flag);
  $(".country-capital").html(result.capital);
  $("#population").html(result.population.toLocaleString("en"));
  getCountryPoly();
  getWeatherAndCurrency(result.capital, result.currency);
};

//Gets country border, highlights it, and calls functions to populate area on map
const getCountryPoly = () => {
  $.ajax({
    url: "libs/php/getCountryPoly.php",
    type: "POST",
    dataType: "json",
    data: {
      iso2: countryCode,
    },
    success: function (result) {
      geoPoly = result.border;
      if (result) {
        if (bounds != undefined) {
          map.removeLayer(bounds);
        }
        bounds = L.geoJson(geoPoly, { style: polyStyle }).addTo(map);
        map.flyToBounds(bounds.getBounds(), {
          animate: false,
        });
        let north = bounds.getBounds()["_northEast"].lat;
        let south = bounds.getBounds()["_southWest"].lat;
        let east = bounds.getBounds()["_northEast"].lng;
        let west = bounds.getBounds()["_southWest"].lng;
        getCountryData(north, south, east, west);
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
};

//Populates map with markers
const getCountryData = (northBound, southBound, eastBound, westBound) => {
  $.ajax({
    url: "libs/php/getCountryData.php",
    type: "POST",
    dataType: "json",
    data: {
      north: northBound,
      south: southBound,
      east: eastBound,
      west: westBound,
      iso2: $("#dropdown").val(),
    },

    success: function (dataResult) {
      let wikiMarker;
      let earthquakeMarker;
      let weatherStationMarker;
      dataResult.WikiBox.forEach((wiki) => {
        wikiMarker = L.marker([wiki.lat, wiki.lng], { icon: wikiIcon });
        wikiMarker.bindPopup(`<h3>${wiki.title}</h3><p> ${wiki.summary}</p>
                    <p>Read more on <a href="https://${wiki.wikipediaUrl}" target="_blank">Wikipedia</a></p>`);
        markers.addLayer(wikiMarker);
      });

      dataResult.Earthquakes.earthquakes.forEach((earthquake) => {
        earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {
          icon: earthquakeIcon,
        });
        earthquakeMarker.bindPopup(
          `<p>Time of earthquake: ${earthquake.datetime}</p><p>Magnitude:${earthquake.magnitude}</p>`
        );
        markers.addLayer(earthquakeMarker);
      });

      dataResult.wStation.weatherObservations.forEach((weatherStation) => {
        weatherStationMarker = L.marker(
          [weatherStation.lat, weatherStation.lng],
          {
            icon: weatherStationIcon,
          }
        );
        weatherStationMarker.bindPopup(
          `
                <p>Weather Station: ${weatherStation.stationName}<p>
                <p>Temperature: ${weatherStation.temperature}&#176;C</p>
                <p>Clouds: ${weatherStation.clouds}</p>
                <p>Humidity: ${weatherStation.humidity}%</p>
                <p>Wind Speed: ${weatherStation.windSpeed}mph</p>`
        );
        markers.addLayer(weatherStationMarker);
        
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
};


//Gets country from dropdown val & calls functions to populate map & info
$("#dropdown").on("change", function () {
  getRestCountries($("#dropdown").val());
});



//Shows loading div while ajax calls are being performed
$(document)
  .ajaxStart(function () {
    $loading.show();
  })
  .ajaxStop(function () {
    $loading.hide();
  });

//Calls functions to populate map & info based off user location or map click
const getLocation = (lat, lng) => {
  $.ajax({
    url: "./libs/php/getClickLatLng.php",
    type: "POST",
    cache: false,
    data: {
      latitude: lat,
      longitude: lng,
    },
    dataType: "json",
    timeout: 2000,
    success: function (result) {
      if (result.status.name == "ok") {
        getRestCountries(result.clickCode);
        $('#dropdown').val(result.clickCode.toUpperCase());
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
};

//Gets user location & calls functions to populate map & info
if (window.navigator.geolocation) {
  window.navigator.geolocation.getCurrentPosition((e) => {
    lat = e.coords.latitude;
    lng = e.coords.longitude;
    getLocation(lat, lng);
  }, console.log);
}

//Gets location from map click & calls functions to populate map & info
map.on("click", (e) => {
  lat = e.latlng.lat;
  lng = e.latlng.lng;
  getLocation(lat, lng);
});


//Shows & hides more info
$("#more-info-button").on("click", () => {
  if ($("#more-info-button").text() == "More Info") {
    $("#more-info-button").html("Close Info");
  } else {
    $("#more-info-button").html("More Info");
  }
  $("#more-info").toggle();
});

//Populates select box
$("document").ready(() => {
  populateSelect();
});


