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
let ISS;
let issMarker;
let ISSTimeout;
let myBounds = [
  [-90, -180],
  [90, 180],
];
//Icon Styles
const earthquakeIcon = L.icon({
  iconUrl: "./libs/images/earthquake-icon.png",
  iconSize: [50, 50],
});
const issIcon = L.icon({
  iconUrl: "./libs/images/iss-icon.png",
  iconSize: [150, 75],
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

const OpenStreetMap_Mapnik = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    minZoom: 2,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

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

const Esri_NatGeoWorldMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    maxZoom: 12,
    minZoom: 2,
  }
);
const baseMaps = {
  "Nat Geo World Map": Esri_NatGeoWorldMap,
  "Open Street Map": OpenStreetMap_Mapnik,
  "Open Todo": OpenTopoMap,
  "Dark Matter": CartoDB_DarkMatter,
};
const overlayMaps = {
  Markers: markers,
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
const getWeatherAndCurrency = (cap, curr, lat, lng) => {
  $.ajax({
    url: "libs/php/getWeatherAndCurrency.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCapital: cap,
      currency: curr,
      lat: lat,
      lng: lng,
    },
    success: function (result) {
      if (result.status.name == "ok") {
        // $("#country-exchange").html(result.rate.toFixed(2));
        let sunrise = result.timezone.sunrise.split(" ");
        let sunset = result.timezone.sunset.split(" ");
        $("#temp").html(`${result.main.temp}&#176;C`);
        $("#feels-like").html(`${result.main.feels_like}&#176;C`);
        $("#pressure").html(`${result.main.pressure}mb`);
        $("#humidity").html(`${result.main.humidity}%`);
        $("#min-max").html(
          `${result.main.temp_min}/${result.main.temp_max}&#176;C`
        );
        $("#sunset").html(sunset[1]);
        $("#sunrise").html(sunrise[1]);
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
  let altSpelling1 =
    result.restCountries.altSpellings[1] === undefined
      ? ""
      : `, ${result.restCountries.altSpellings[1]}`;
  let altSpelling2 =
    result.restCountries.altSpellings[2] === undefined
      ? ""
      : `, ${result.restCountries.altSpellings[2]}`;

  countryCode = result.countryCode;
  countryCur = result.currency;
  $("#demonym").html(result.restCountries.demonym);
  $("#alt-spellings").html(
    `${result.restCountries.altSpellings[0]}${altSpelling1}${altSpelling2}`
  );
  $("#domain").html(result.restCountries.topLevelDomain[0]);
  $("#native-name").html(result.restCountries.nativeName);
  $("#language").html(result.restCountries.languages[0].name);
  $("#country-region").html(result.region);
  $("#country-name").html(result.name);
  $("#calling-code").html(`+${result.restCountries.callingCodes[0]}`);
  $("#currency").html(
    `${result.currency} &#124; ${result.restCountries.currencies[0].name} (${result.restCountries.currencies[0].symbol})`
  );
  $("#country-flag").attr("src", result.flag);
  $(".country-capital").html(result.capital);
  $("#population").html(result.population.toLocaleString("en"));
  $("#time-zone").html(result.restCountries.timezones[0]);
  $("#country-subregion").html(result.restCountries.subregion);
  $("#alpha-codes").html(
    `${result.restCountries.alpha2Code} &#124; ${result.restCountries.alpha3Code}`
  );
  getCountryPoly();
  getWeatherAndCurrency(
    result.capital,
    result.currency,
    result.restCountries.latlng[0],
    result.restCountries.latlng[1]
  );
};

const trackISS = () => {
  $.ajax({
    url: "libs/php/getISSData.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      if (issMarker != undefined) {
        map.removeLayer(issMarker);
      }
      markers.clearLayers();
      issMarker = L.marker([result.ISS.latitude, result.ISS.longitude], {
        icon: issIcon,
        animate: false,
        zoom: 5
      });
      issMarker.addTo(map);
      $('#dropdown').val('initial');
      map.flyTo([result.ISS.latitude, result.ISS.longitude]);
      $('.satellite-popup').html('Stop ISS')
      $("#iss-button").html("<i class='far fa-stop-circle'></i>");
      $("#iss-button").attr("name", "stop");
      $("#more-country-info").hide();
      $("#more-covid-info").hide();
      $("#more-weather-info").hide();
      $("#more-weather-button").hide();
      $("#more-virus-button").hide();
      $("#more-info-button").hide();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
  ISSTimeout = setTimeout(trackISS, 3000);
};

const stopISS = () => {
      clearTimeout(ISSTimeout);
      $('.satellite-popup').html('Track ISS')
      if(issMarker!=undefined){
      map.removeLayer(issMarker);
      }
      $("#iss-button").attr("name", "satellite");
      $("#iss-button").html("<i class='fas fa-satellite icon'></i>");
      $("#more-weather-button").show();
      $("#more-virus-button").show();
      $("#more-info-button").show();
      
}

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
        getCities(north, south, east, west);
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
    },
  });
};

const setEarthquakes = (result) => {
  let earthquakeMarker;
  result.earthquakes.forEach((earthquake) => {
    earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {
      icon: earthquakeIcon,
    });
    earthquakeMarker.bindPopup(
      `
      <table class="table table-borderless earthquake-table">
      <tr><td colspan="3" style="font-size: 25px; color:rgb(98, 27, 27);font-weight:bold;">Earthquake</td></tr>
        <tr>
          <td>
          <i class="fas fa-thumbtack icon"></i>
          </td>
          <td>
          Lat &#124; Long
          </td>
          <td>
          ${earthquake.lat.toFixed(2)} &#124; ${earthquake.lng.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td>
          <i class="fas fa-clock icon"></i>
          </td>
          <td>
          Time
          </td>
          <td>
          ${earthquake.datetime}
          </td>
        </tr>
        <tr>
          <td>
          <i class="fas fa-chart-area icon"></i>
          </td>
          <td>
          Magnitude
          </td>
          <td>
          ${earthquake.magnitude}
          </td>
        </tr>
        <tr>
          <td>
          <i class="fas fa-globe-europe icon"></i>
          </td>
          <td>
          Depth
          </td>
          <td>
          ${earthquake.depth}km
          </td>
        </tr>
      </table> `
    );
    markers.addLayer(earthquakeMarker);
  });
};

//Sets city markers
const setCities = (result) => {
if (result.places.geonames){

  let cityMarker;
  result.places.geonames.forEach((place) => {
    cityMarker = L.marker([place.lat, place.lng], {
      icon: cityIcon,
    });
    $("#city-table").append(`
                            <tr>
                            <td align="left">${place.name}</td>
                            <td>${place.population.toLocaleString("en")}</td>
                            <td>${place.lat.toFixed(
                              2
                            )} &#124; ${place.lng.toFixed(2)}</td>
                            </tr> 
                            `);
    cityMarker.bindPopup(
      `<table class="table table-borderless places">
                          <tr>
                              <td colspan="3" style="font-size: 30px;color: rgb(139, 0, 121);font-weight:bold;">${
                                place.name
                              }</td>
                          </tr>
                         
                          <tr>
                              <td><i class="fas fa-users icon"></i></td>
                              <td>Population</td>
                              <td>${place.population.toLocaleString("en")}</td>
                          </tr>
                          <tr>
                              <td><i class="fas fa-thumbtack icon"></i></td>
                              <td>Lat &#124; Lng</td>
                              <td>${place.lat.toFixed(
                                2
                              )} &#124; ${place.lng.toFixed(2)}</td>
                          </tr>
                          <tr>
                              <td><i class="fab fa-wikipedia-w icon"></i></td>
                              <td align="right" colspan="2">Read more on <a href="https://${
                                place.wikipedia
                              }" target="_blank">Wikipedia</a></td>
                          </tr>
                      </table>`
    );
    markers.addLayer(cityMarker);
  });
} else {
  $loading.hide();
}
};

//Sets wiki markers
const setWiki = (result) => {
  let wikiMarker;
  result.forEach((wiki) => {
    wikiMarker = L.marker([wiki.lat, wiki.lng], { icon: wikiIcon });
    wikiMarker.bindPopup(`
                          <table class="table table-borderless">
                          <tr><td style="font-size: 30px; color:orange;">${wiki.title}</td></tr>
                          <tr><td align="left" style="font-size: 14px">${wiki.summary}</td></tr>
                          <tr><td>Read more on <a href="https://${wiki.wikipediaUrl}" target="_blank">Wikipedia</a></td></tr>`);
    markers.addLayer(wikiMarker);
  });
};
//Sets weather markers
const setWeatherStations = (result) => {
  let weatherStationMarker;
  result.forEach((weatherStation) => {
    weatherStationMarker = L.marker([weatherStation.lat, weatherStation.lng], {
      icon: weatherStationIcon,
    });
    weatherStationMarker.bindPopup(
      `      
            <table  class="table table-borderless weather-station">
              <tr>
              <td style="font-size:25px;color:rgb(113,0,0);font-weight:bold;" colspan="3" align="center">${weatherStation.stationName} Weather Station</td>
              </tr>
              <tr>
              <td><i class="fas fa-thermometer-half icon"></i></td>
              <td>Temp</td>
              <td>${weatherStation.temperature}&#176;C</td>
              </tr>
              <tr>
              <td><i class="fas fa-cloud icon"></i></td>
              <td>Clouds</td>
              <td>${weatherStation.clouds}</td>
              </tr>
              <tr>
              <td><i class="fas fa-tint icon"></i></td>
              <td>Humidity</td>
              <td>${weatherStation.humidity}%</td>
              </tr>
              <tr>
              <td><i class="fas fa-wind icon"></i></td>
              <td>Wind Speed</td>
              <td>${weatherStation.windSpeed}mph</td>
              </tr>

            </table>`
    );
    markers.addLayer(weatherStationMarker);
  });
};
//Sets covid data
const setCovid = (result) => {
  $("#covid-country").html(result.Country);
  $("#new-confirmed").html(result.NewConfirmed.toLocaleString("en"));
  $("#new-deaths").html(result.NewDeaths);
  $("#new-recovered").html(result.NewRecovered.toLocaleString("en"));
  $("#total-confirmed").html(result.TotalConfirmed.toLocaleString("en"));
  $("#total-deaths").html(result.TotalDeaths.toLocaleString("en"));
  $("#total-recovered").html(result.TotalRecovered.toLocaleString("en"));
};


//Populates map with markers
const getCities = (northBound, southBound, eastBound, westBound) => {
  $.ajax({
    url: "libs/php/getCities.php",
    type: "POST",
    dataType: "json",
    data: {
      north: northBound.toFixed(2),
      south: southBound.toFixed(2),
      east: eastBound.toFixed(2),
      west: westBound.toFixed(2),
    },

    success: function (result) {
 
      setCities(result);
      
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
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
      //! Set Wiki
      setWiki(dataResult.WikiBox);
      //! Set Earthquakes
      setEarthquakes(dataResult.Earthquakes);
      //! Set Weather Stations
      setWeatherStations(dataResult.wStation.weatherObservations);
      //! Set Covid Data
      setCovid(dataResult.covid);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    },
  });
};

//Gets country from dropdown val & calls functions to populate map & info
$("#dropdown").on("change", function () {
  getRestCountries($("#dropdown").val());
  stopISS();
  $('.satellite-popup').hide();
});

$('document').on('click', () => {
  $('.satellite-popup').hide();
})

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
        $("#dropdown").val(result.clickCode.toUpperCase());
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
  stopISS();
  getLocation(lat, lng);
  $('.satellite-popup').hide();
});

//Shows & hides more info
$("#more-info-button").on("click", () => {
  $("#more-covid-info").hide();
  $("#more-weather-info").hide();
  $("#more-city-info").hide();
  $("#more-country-info").toggle();
});

//Shows and hides more coronavirus info
$("#more-virus-button").on("click", () => {
  $("#more-country-info").hide();
  $("#more-weather-info").hide();
  $("#more-city-info").hide();
  $("#more-covid-info").toggle();
});

$("#more-weather-button").on("click", () => {
  $("#more-country-info").hide();
  $("#more-covid-info").hide();
  $("#more-weather-info").toggle();
});

$("#more-cities-button").on("click", () => {
  $("#more-covid-info").hide();
  $("#more-weather-info").hide();
  $("#more-country-info").hide();
  $("#more-city-info").toggle();
});

$("#iss-button").on("click", () => {
  if($('#iss-button').attr('name') === "satellite"){
  trackISS();
  } else {
    stopISS();
    window.navigator.geolocation.getCurrentPosition((e) => {
      lat = e.coords.latitude;
      lng = e.coords.longitude;
      getLocation(lat, lng);
    }, console.log);
  }
});

 
  $('#iss-button').on('mouseenter touchstart', () => {
    if($('#iss-button').attr('name') === "satellite"){
    $('.satellite-popup').show();
    }
    });
  $('#iss-button').on('mouseleave touchend', () => {
    $('.satellite-popup').hide();
  });


//Shows loading div while ajax calls are being performed
$(document)
  .ajaxStart(function () {
    $loading.show();
  })
  .ajaxStop(function () {
    $loading.hide();
  });

//Populates select box
$("document").ready(() => {
  populateSelect();
});
