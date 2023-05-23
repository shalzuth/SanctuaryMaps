var crs = L.CRS.Simple;
var map = new L.Map('map', { minZoom: 0, maxZoom: 18, crs: L.CRS.Simple, attributionControl: false, zoomControl: false, preferCanvas: true }).setView([-100, 100], 3);
var tileLayer = L.tileLayer('img/Sanctuary/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: 18, noWrap: true, tms: false, maxNativeZoom: 4 }).addTo(map);
var altarIcon = L.icon({ iconUrl: 'img/mapicons/altaroflilith.png', iconSize: [40, 40] });
var dungeonIcon = L.icon({ iconUrl: 'img/mapicons/dungeon.png', iconSize: [40, 40] });
var cellarIcon = L.icon({ iconUrl: 'img/mapicons/cellar.png', iconSize: [40, 40] });
var waypointIcon = L.icon({ iconUrl: 'img/mapicons/waypoint.png', iconSize: [30, 30] });
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
        markers.push({name: m.name, marker: L.marker([m.x, m.y], {icon: icon}).addTo(group).bindTooltip(tooltip)});
        locationMap[m.name] = [m.x, m.y];
    }
    group.addTo(map);
    overlayMaps[overlayMapNames[i]] = group;
}
var layerControl = L.control.layers(null, overlayMaps).addTo(map);

var fuse = new Fuse(namesToSearch, { shouldSort: true, threshold: 0.6, location: 0, distance: 100, minMatchCharLength: 1});
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