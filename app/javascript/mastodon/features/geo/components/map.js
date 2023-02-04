import React, { useCallback, useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapSettings } from '../config';

export const MapView = (props) => {
  const { showMarker, setMarkerCoords, startCoords, mapSource } = props;
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(null);
  const [mapStyle, setMapStyle] = useState(0);
  const [coords, setCoords] = useState(startCoords);
  const [zoom] = useState(14);
  const [marker, setMarker] =  useState(false);

  const mapSymbols = ['free', 'air', 'wild', 'camp'];

  const layerDesign = [
    {
      'id': 'pointlayer',
      'type': 'circle',
      'source': 'mapsource',
      'minzoom': 0,
      'maxzoom': 7,
      'paint': {
        'circle-radius':  [
          'interpolate', ['linear'], ['zoom'],
          0, 0,
          8, 5,
        ],
        'circle-opacity': [
          'interpolate', ['linear'], ['zoom'],
          3, 0.3,
          8, 0.8,
        ],
        'circle-color': [
          'match',
          ['get', 'placetype'],
          'air',
          '#FFA203',
          'camp',
          '#B500E8',
          'free',
          '#007FFF',
          'wild',
          '#21C901',

          /* other */ '#ccc',
        ],
      },
    },
    {
      'id': 'maplayer1',
      'type': 'symbol',
      'source': 'mapsource',
      'minzoom': 7,
      'maxzoom': 24,
      'layout': {
        'icon-size': {
          'stops': [
            [0, 0.025],
            [4, 0.075],
            [9, 0.1],
            [14, 0.15],
          ],
        },
        'icon-offset': [0, -100],
        'icon-image': [
          'get', 'placetype',
        ],
        'icon-allow-overlap': true,
      },
    },
  ];

  const textLayerDesign = {
    'id': 'textlayer',
    'type': 'symbol',
    'source': 'mapsource',
    'minzoom': 7,
    'layout': {
      'text-field': '{placename}',
      'text-font': ['Open Sans', 'Arial Unicode MS Bold'],
      'text-size': {
        'stops': [
          [6, 9],
          [14, 13],
        ],
      },
      'text-offset': [0, 0.1],
      'text-anchor': 'top',
      'text-allow-overlap': false,
    },
  };

  const [geoControl] = useState (new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: false,
  }));

  const loadSymbols = () => {
    mapSymbols.forEach(symbol => {
      map.loadImage('/geo/' + symbol + '.png', (error, image) => {
        try {
          map.addImage(symbol, image);
        } catch (error) {
          console.log(error);
        }
      });
    });
  };

  const addLayer = () => {
    map.addSource('mapsource', { type: 'geojson', data: mapSource });
    layerDesign.map(design => map.addLayer(design));
    map.addLayer(textLayerDesign);
  };

  useEffect(() => { // init map at mount
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/${MapSettings.map_styles[mapStyle].map_id}/style.json?key=${MapSettings.map_api_key}`,
      center: coords,
      zoom: zoom,
    });

    map.on('load', () => setMapLoaded(true));
    setMap(map);

    return () => {
      if (map)
        map.remove();
    };
  }, []);

  useEffect(() => { // Add Controls after map loaded
    if (mapLoaded) {
      map.addControl(new maplibregl.NavigationControl({
        showCompass: false }), 'top-right');

      map.on('moveend', onMoveEnd);
      map.addControl(geoControl);
      loadSymbols();
      addLayer();
    }
  }, [mapLoaded]);

  useEffect(() => { // Handle Forms/Steps, but only after Map loaded
    if (!mapLoaded) return;
    if (showMarker&&!marker) { // create marker
      let newMarker = new maplibregl.Marker(
        { 'color': '#ff6f00',
          'draggable': true,
        });
      newMarker
        .setLngLat(coords)
        .addTo(map);
      setMarkerCoords(coords);
      setMarker(newMarker);
    } else if (!showMarker&&marker) { // remove marker
      marker.remove();
      setMarker(false);
    }

  }, [showMarker, mapLoaded]);

  useEffect(() => { // Handle Marker
    if (marker){
      marker.on('dragend', onMarkerDragEnd);
      map.on('touchmove', onTouchMove);
      geoControl.on('geolocate', onGeolocate);
    }
  }, [marker]);

  function onMoveEnd() {
    if (!map) return;
    let { lng, lat }  = map.getCenter();
    setCoords([lng, lat]);
  }

  function onTouchMove() {
    let { lng, lat } = map.getCenter();
    if (marker) {
      marker.setLngLat([lng, lat]);
      setMarkerCoords([lng, lat]);
    }
  }

  function onMarkerDragEnd() {
    if (!marker) return;
    let { lng, lat } = marker.getLngLat();
    setMarkerCoords([lng, lat]);
  }

  function onGeolocate (e) {
    if (marker) {
      marker.setLngLat([e.coords.longitude, e.coords.latitude]);
      onMarkerDragEnd();
    }
  }

  return (
    <div ref={mapContainer} className='map'>
      {props.children}
    </div>

  );
};
