var mapBounds = L.latLngBounds(L.latLng(-800, -500), L.latLng(500, 800));
var map = new L.Map('map', { minZoom: 0, maxZoom: 5, crs: L.CRS.Simple, attributionControl: false, zoomControl: false, preferCanvas: true, maxBounds: mapBounds }).setView([-100, 100], 3);

var tileLayerBounds = L.latLngBounds(L.latLng(-185, 5), L.latLng(-5, 185));
var tileLayer = L.tileLayer('img/Sanctuary/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: 5, noWrap: true, tms: false, maxNativeZoom: 4, bounds: tileLayerBounds }).addTo(map);

var altarIcon = { url: 'img/mapicons/altaroflilith.png', size: [40, 40] };
var dungeonIcon = { url: 'img/mapicons/dungeon.png', size: [40, 40] };
var cellarIcon = { url: 'img/mapicons/cellar.png', size: [40, 40] };
var waypointIcon = { url: 'img/mapicons/waypoint.png', size: [30, 30] };
var chestIcon = { url: 'img/mapicons/chest.png', size: [50, 50] };
var namesToSearch = [];
var markers = [];
var locationMap = [];
var overlayMapNames = ['Waypoints', 'Dungeons', 'Altars of Lilith', 'Cellars', 'Helltide Chests'];
var icons = [waypointIcon, dungeonIcon, altarIcon, cellarIcon, chestIcon];
var groupings = [waypoints, dungeons, altars, cellars, chests];
var overlayMaps = {};


var urlParams = new URLSearchParams(window.location.search);
var x = urlParams.get('x');
var y = urlParams.get('y');

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

if(x != null && y != null)
{
    console.log([x, y]);
    var points = rotate(1449, 2909, x, y, -45);
    console.log(points);
    var rotatedScaledX = points[0] * 1.0666667 * 194 / 4096;
    var rotatedScaledY = points[1] * 1.0666667 * 194 / 4096;
    var mapX = -146.5 - rotatedScaledY;
    var mapY = 194 - rotatedScaledX;
    L.marker([mapX, mapY]).addTo(map);
    map.flyTo([mapX, mapY], 5);
}
else{
    for (let i = 0; i < groupings.length; i++) {
        var g = groupings[i];
        var icon = icons[i];
        var group = L.layerGroup();
        for (m of g) {
            var tooltip = m.name;
            if (m.description != null) tooltip += '</br>' + m.description;
            namesToSearch.push(tooltip);
            markers.push({name: m.name, marker: L.canvasMarker([m.x, m.y], {img: icon}).addTo(group).bindTooltip(tooltip)});
            locationMap[tooltip] = [m.x, m.y];
        }
        group.addTo(map);
        overlayMaps[overlayMapNames[i]] = group;
    }
}

var layerControl = L.control.layers(null, overlayMaps).addTo(map);

var fuse = new Fuse(namesToSearch, { shouldSort: true, threshold: 0.2, location: 0, distance: 1000, minMatchCharLength: 1});
var searchbox = L.control.searchbox({ position: 'topright', expand: 'left'}).addTo(map);
searchbox.onInput("keyup", function (e) {
    var value = searchbox.getValue();
    if (value != "") {
        var results = fuse.search(value);
        searchbox.setItems(results.map(res => res.item).slice(0, 5));
        $('.leaflet-searchbox-autocomplete-item').each(function(){                
            $(this)[0].onclick = function() {
                map.flyTo(locationMap[$(this)[0].textContent], 5);
            };
         });
    } else {
        searchbox.clearItems();
    }
});

