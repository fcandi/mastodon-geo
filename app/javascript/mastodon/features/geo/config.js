const env = process.env.NODE_ENV || 'development';

// Place Types
export const placeOptions = [
  { id: 'free', name: 'geo.place_type.free', default: 'Free Parking', icon: 'rv-icon.png', color: '#007FFF', color_background: '#cffcff' },
  { id: 'air', name: 'geo.place_type.air', default: 'Payed Parking',  icon: 'rv-icon.png', color: '#FFA203', color_background: '#faeba8' },
  { id: 'wild', name: 'geo.place_type.wild', default: 'Wild Spot',  icon: 'trees-icon.png', color: '#21C901', color_background: '#d6fb7b' },
  { id: 'camp', name: 'geo.place_type.camp', default: 'Campsite',  icon: 'camp-icon.png', color: '#B500E8', color_background: '#ffdfd5' },
];

export const map_std_options = [
  {id: 1, name: "map_all", url: "/api/v1/json_all", logged_in:false },
  {id: 2, name: "map_my", url: "/api/v1/json_user/", logged_in:true},
  {id: 3, name: "map_like", url: "/api/v1/json_likes/", logged_in:true}
];

// Map Configuration
export const MapSettings = {
  map_api_key: env === 'development' ? 'LW1qWnkfWEsDREq6tal7' : 'tctCyWyLAFjiVbIJz6Xn',
  map_api_host: 'https://api.maptiler.com/maps/',
  map_styles:
    [ {
      'map_id': '5523395a-f4d1-40ad-b523-8e90dda7a826',
      //'icon': faMountain,
      dark: false
    },
    {
      'map_id': 'hybrid',
     // 'icon': faGlobeEurope,
      dark: true,
    }],
};

export const GeoSettings = {
  geobla_old_host: 'https://api.geobla.com',
};
