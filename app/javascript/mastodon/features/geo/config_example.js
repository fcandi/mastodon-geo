// Rename to config.js
// Place Types
export const placeOptions = [
  { id: 'free', name: 'geo.place_type.free', default: 'Free Parking', icon: 'faRv', color: '#007FFF', color_background: '#cffcff' },
  { id: 'paid', name: 'geo.place_type.paid', default: 'Payed Parking',  icon: 'faRv', color: '#FFA203', color_background: '#faeba8' },
  { id: 'wild', name: 'geo.place_type.wild', default: 'Wild Spot',  icon: 'faTrees', color: '#21C901', color_background: '#d6fb7b' },
  { id: 'camp', name: 'geo.place_type.camp', default: 'Campsite',  icon: 'faCampground', color: '#B500E8', color_background: '#ffdfd5' },
];

// Map Configuration
export const MapSettings = {
  map_api_key: 'your api key',
  map_api_host: 'https://api.maptiler.com/maps/',
  map_styles:
    [ {
      'map_id': 'style od',
      //'icon': faMountain,
    },
    {
      'map_id': 'hybrid',
     // 'icon': faGlobeEurope,
      'dark': true,
    }],
};
