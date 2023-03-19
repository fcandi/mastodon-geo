import React, { useCallback, useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapSettings } from '../config';
import ReactDOM from 'react-dom';

export const MapView = (props) => {
  const { showMarker, setMarkerCoords, mapCommand, mapStyle,
    mapSource, allowBackClick, backClick, showPopup, reloadSource } = props;
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(null);
  const [coords, setCoords] = useState(mapCommand.goToCoordinates);
  const [zoom] = useState(mapCommand.goToZoom);
  const [marker, setMarker] =  useState(false);
  const [popup, setPopup] =  useState(false);

  const mapSymbols = ['free', 'paid', 'wild', 'camp', 'campg', 'freeg'];

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
          'paid',
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


  const textLayerDesignDark = {
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
    'paint': {
      'text-color': '#FFFFFF',
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
    map.addLayer(MapSettings.map_styles[mapStyle].dark === true ? textLayerDesignDark : textLayerDesign);
  };

  const removeLayer = () => {
    try {
      map.removeLayer('textlayer');
      layerDesign.map(design => {
        map.removeLayer(design.id)
      });
      map.removeSource("mapsource");
    } catch (error) {
      console.log(error);
    }
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

  useEffect(() => { // init map at mount
    if (mapLoaded) {
      removeLayer();
      map.setStyle(`https://api.maptiler.com/maps/${MapSettings.map_styles[mapStyle].map_id}/style.json?key=${MapSettings.map_api_key}`, { diff: true });
      map.once("idle", () => {
        addLayer();
        loadSymbols();
      });

    }
  }, [mapStyle]);



  useEffect(() => { // Add Controls after map loaded
    if (mapLoaded) {
      map.addControl(new maplibregl.NavigationControl({
        showCompass: false }), 'top-right');
      map.addControl(geoControl);
      loadSymbols();
      addLayer();
      map.on('moveend', onMoveEnd);
      map.on('click', onMapClick);
      doMapCommand();
    }
  }, [mapLoaded]);

  useEffect(() => { // Handle Forms/Steps, but only after Map loaded
    if (!mapLoaded) return;
    if (showMarker&&!marker) { // create marker
      let newMarker = new maplibregl.Marker(
        { 'color': '#ff6f00',
          'draggable': true,
        });


      let { lng, lat }  = map.getCenter();
      newMarker
        .setLngLat(props.initMarker || [lng, lat])
        .addTo(map);
      setMarker(newMarker);
      props.updateNewMarker([lng, lat]);
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

  useEffect (() => { // Handle Map COmmand
    if (!mapLoaded) return;
    doMapCommand();
  }, [mapCommand]);

  useEffect (() => { // Handle Map COmmand
    console.log('RELOAD?');
    if (reloadSource) {
      console.log('UND LOS');
      map.getSource('mapsource').setData( mapSource );
    }
  }, [reloadSource]);

  useEffect (() => { // Handle Map COmmand
    if (mapLoaded) {
      console.log('UND NEUE DATE');
      map.getSource('mapsource').setData( mapSource );
    }
  }, [mapSource]);

  useEffect(() => { // popup
    if (!mapLoaded) return;
    if (showPopup&&!popup) { // create popup
      const popupNode = document.createElement('div');
      ReactDOM.render(
        <PopUp />,
        popupNode,
      );
      let newPopup = new maplibregl.Popup({
        closeOnClick: true,
        anchor: 'bottom',
        offset: 30,
      })
        .setLngLat([showPopup.lng, showPopup.lat])
        .setDOMContent(popupNode)
        .addTo(map);
      setPopup(newPopup);
    } else if (!showPopup&&popup) { // deletePopup
      popup.remove();
      setPopup(false);
    }
  }, [showPopup, mapLoaded]);

  const doMapCommand = () => {
    let flyto=false;
    const currentZoom = map.getZoom();

    let { lng, lat }  = map.getCenter();
    let cc = [lng, lat];

    // ZOOM
    let zoom = mapCommand.goToZoom || mapCommand.goToMinZoom;
    if (mapCommand.goToMinZoom && currentZoom>zoom) zoom=currentZoom;
    if (zoom!==currentZoom) flyto=true;

    // COORDS
    if (mapCommand.goToCoordinates) {
      cc = mapCommand.goToCoordinates;
      flyto=true;
    } else if (mapCommand.showCoordinates) {
      if (!map.getBounds().contains(mapCommand.showCoordinates)) {
        cc = mapCommand.showCoordinates;
        flyto=true;
      }
    }

    if (flyto)
      map.flyTo({
        center: cc,
        speed: 3,
        zoom: zoom || currentZoom,
        maxDuration: 700,
      });


    if (mapCommand.setMarker&&marker) {
      //marker.setLngLat(mapCommand.setMarker);
    }


  };

  function onMoveEnd() {
    if (!map) return;
    let { lng, lat }  = map.getCenter();
    setCoords([lng, lat]);

    // Baustelle: Marker einfangen
    if (marker && !map.getBounds().contains(marker.getLngLat())) {
      setMarkerCoords([lng, lat]);
    }
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

  const backToMap = () =>  {
    if (allowBackClick)
      backClick();
  };



  const PopUp = () =>
    (<div className={'map-popup'} onClick={()=>props.openPlace(showPopup.id)}>
      {showPopup.placename}
    </div>);
  function onMapClick (e) {
    let hit = false;
    let myid=false;
    var features = map.queryRenderedFeatures(e.point, { layers: ['maplayer1', 'textlayer'] });
    if (features) {
      features.forEach(f => {
        if (myid) return;
        myid = f.properties.id;
        if (myid) {
          hit=true;
          props.openPlace(myid);
        }
      });
    }
    if (!hit)
      backToMap();
  }

  return (
    <div ref={mapContainer} className='map'>
      {mapLoaded && props.children}
    </div>

  );
};
