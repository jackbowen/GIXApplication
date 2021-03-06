///////////////////
//// MAP STUFF ////
///////////////////

var currentYear = "2011";
var layer;
/*var tilesUrl = '../resources/map_tiles/{yearFolder}/{z}/{x}/{y}.png';
var tiles2005 = L.tileLayer(tilesUrl, {yearFolder: '2005'}),
    tiles2006 = L.tileLayer(tilesUrl, {yearFolder: '2006'}),
    tiles2007 = L.tileLayer(tilesUrl, {yearFolder: '2007'}),
    tiles2008 = L.tileLayer(tilesUrl, {yearFolder: '2008'}),
    tiles2009 = L.tileLayer(tilesUrl, {yearFolder: '2009'}),
    tiles2010 = L.tileLayer(tilesUrl, {yearFolder: '2010'}),
    tiles2011 = L.tileLayer(tilesUrl, {yearFolder: '2011'}),
    tiles2012 = L.tileLayer(tilesUrl, {yearFolder: '2012'}),
    tiles2013 = L.tileLayer(tilesUrl, {yearFolder: '2013'}),
    tiles2014 = L.tileLayer(tilesUrl, {yearFolder: '2014'}),
    tiles2015 = L.tileLayer(tilesUrl, {yearFolder: '2015'}),
    tiles2016 = L.tileLayer(tilesUrl, {yearFolder: '2016'});
*/

// Map is absolutely positioned. Correctly positions the paragraph that follows it.
function calcMapSpacer() {
  var mapSpacer = $('#map').height() + 20;
  $('#mapSpacer').css('margin-top', mapSpacer + "px");
}

// TODO: tidy up global vars
var bounds; 
var stopsMap;
var currentImg;

function startMap() {
  var mapElementWidth = $('#map').width();
  stopsMap = L.map('map', {
    crs: L.CRS.Simple,
  });
  bounds = [[0,0], [mapElementWidth, mapElementWidth]];
  
  currentImg = L.imageOverlay('../resources/map_tiles/2011.jpg', bounds);
  currentImg.addTo(stopsMap);
  stopsMap.fitBounds(bounds); //Sets a map view that contains the given geographical bounds with the maximum zoom level possible.
  stopsMap.setMaxBounds(bounds);
  stopsMap.setMaxZoom(Math.floor(6-mapElementWidth/750));
  stopsMap.scrollWheelZoom.disable();
 

  // Toggle scroll wheel zoom on map
  stopsMap.on('click', function() {
    stopsMap.scrollWheelZoom.enabled() ? stopsMap.scrollWheelZoom.disable() : stopsMap.scrollWheelZoom.enable();
  }); 


  // Insert map legend
  //TODO: add open / close icon?
  var mapLegend = '<div id="mapLegend"><div><span class="dot" id="asianPacIslander">&#9679;</span>Asian||Pacific Islander</div><div><span id="black">&#9679;</span>Black</div><div><span id="amIndianAlaskan">&#9679;</span>American Indian||Alaskan</div><div><span id="blackHispanic">&#9679;</span>Black Hispanic</div><div><span id="whiteHispanic">&#9679;</span>White Hispanic</div><div><span id="white">&#9679;</span>White</div><div><span id="other">&#9679;</span>Other</div></div>';
  var bottomLeft = document.getElementsByClassName('leaflet-bottom leaflet-left')[0];
  bottomLeft.innerHTML = mapLegend;

  selectYear(2011);

  calcMapSpacer();
  styleYearSelector();
}

function selectYear(year) {
  // Unload old map so as not to crash it
  $('#' + currentYear).removeClass('active');
  var oldRef = '../resources/map_tiles/' + currentYear + '.jpg';
  if (stopsMap.hasLayer(currentImg)) {
    console.log("Removing " + currentYear);
    stopsMap.removeLayer(currentImg);
  } 

  currentYear = year;
  
  // Highlight active year on UI
  $('#' + currentYear).addClass('active');
  currentImg = L.imageOverlay('../resources/map_tiles/' + currentYear + '.jpg', bounds);
  currentImg.addTo(stopsMap);
}

function initMap() {
  var startColor = 'E8D2BE';
  var endColor = '96D2BE';
  var textColor = '#3D4F39';
  var linkColor = '#4a617a';
  startMap();
  init(startColor, endColor);
};

$(window).resize(function() {
  fitMap();
  styleYearSelector();
  calcMapSpacer();
});

$(window).bind('resizeEnd', function() {
  selectYear(currentYear);
});

function fitMap() {
  var mapElementWidth = $('#map').width();
  bounds = [[0,0], [mapElementWidth, mapElementWidth]];
  stopsMap.fitBounds(bounds); //Sets a map view that contains the given geographical bounds with the maximum zoom level possible.
  stopsMap.setMaxBounds(bounds);
  
  if(this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function() {
      $(this).trigger('resizeEnd');
  }, 500);
}

function styleYearSelector() {
  if ($('.projectContent').width() < 562) {
    $('li').css('width', '19%');
    $('li.possiblyLast').css('border-right', 'none');
  }
  else {
    $('li').css('width', '9.65%');
    $('li.possiblyLast').css('border-right', '2px solid #38353B');
  }
}

function updateMapColor(newColor) {
  $('body').css('background-color', newColor);
  $('.projectContent').css('background-color', newColor);
  $('#map').css('background-color', newColor);
  $('.leaflet-control-layers-base label').css('background-color', newColor);
}