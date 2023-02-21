
// Place Types
export const placeOptions = [
  { id: 'free', name: 'geo.place_type.free', default: 'Free Parking', icon: 'rv', color: '#007FFF', color_background: '#cffcff' },
  { id: 'air', name: 'geo.place_type.air', default: 'Payed Parking',  icon: 'rv', color: '#FFA203', color_background: '#faeba8' },
  { id: 'wild', name: 'geo.place_type.wild', default: 'Wild Spot',  icon: 'trees', color: '#21C901', color_background: '#d6fb7b' },
  { id: 'camp', name: 'geo.place_type.camp', default: 'Campsite',  icon: 'camping', color: '#B500E8', color_background: '#ffdfd5' },
];

// Map Configuration
export const MapSettings = {
  map_api_key: 'LW1qWnkfWEsDREq6tal7',
  map_api_host: 'https://api.maptiler.com/maps/',
  map_styles:
    [ {
      'map_id': '5523395a-f4d1-40ad-b523-8e90dda7a826',
      //'icon': faMountain,
    },
    {
      'map_id': 'hybrid',
     // 'icon': faGlobeEurope,
      'dark': true,
    }],
};
