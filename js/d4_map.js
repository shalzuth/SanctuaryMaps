var crs = L.CRS.Simple;
var map = new L.Map('map', { minZoom: 0, maxZoom: 18, crs: L.CRS.Simple, attributionControl: false, zoomControl: false, preferCanvas: true }).setView([-100, 100], 3);
var tileLayer = L.tileLayer('img/Sanctuary/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: 18, noWrap: true, tms: false, maxNativeZoom: 4 }).addTo(map);
var altarIcon = { url: 'img/mapicons/altaroflilith.png', size: [40, 40] };
var dungeonIcon = { url: 'img/mapicons/dungeon.png', size: [40, 40] };
var cellarIcon = { url: 'img/mapicons/cellar.png', size: [40, 40] };
var waypointIcon = { url: 'img/mapicons/waypoint.png', size: [30, 30] };
var namesToSearch = [];
var markers = [];
var locationMap = [];
var overlayMapNames = ['Waypoints', 'Dungeons', 'Altars of Lilith', 'Cellars'];
var icons = [waypointIcon, dungeonIcon, altarIcon, cellarIcon];
var groupings = [waypoints, dungeons, altars, cellars];
var overlayMaps = {};
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