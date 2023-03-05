import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import { MapView } from './components/map';
import { Helmet } from 'react-helmet';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import api from '../../api';
import { fetchStatus } from '../../actions/statuses';
import { ChooseCoords, NewPlaceButton, PlaceForm, PostForm } from './components/place_form';
import { Place } from './components/place';
import Icon from '../../components/icon';
import { GeoSettings, map_std_options } from './config';
import { GeoSelect } from './components/elements';
import NotSignedInIndicator from '../../components/not_signed_in_indicator';
import LoadingBarContainer from '../ui/containers/loading_bar_container';
import LoadingIndicator from '../../components/loading_indicator';

const messages = defineMessages({
  heading: { id: 'geo.map', defaultMessage: 'Map' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
});

const EmptyPlace = {
  placetype: '',
  placename: '',
  lat: false,
  lng: false,
  display: 0,
};
export const GeoIndex = (props) => {

  const { multiColumn, intl, router, dispatch, params, identity } = props;
  const [saving, setSaving] =  useState(false);
  const [isLoading, setIsLoading] =  useState(false);
  const [isError, setIsError] =  useState(false);
  const [place, setPlace] =  useState(false);
  const [mapStyle, setMapStyle] =  useState(0);
  const [reloadSource, setReloadSource] =  useState(false);
  const [step, setStep] =  useState(false);
  const [placeCreated, setPlaceCreated] =  useState(false);
  const [firstPageView, setFirstPageView] = useState(true);
  const [mapList, setMapList] = useState(false);
  const [activeMap, setActiveMap] = useState(false);
  const [mapCommand, setMapCommand] =  useState({
    goToCoordinates: [10, 49 ],
    goToZoom: 3.1,
  });
  const [mapSource, setMapSource] =  useState('/api/v1/json_all');
  const [newPlace, setNewPlace] = useState(EmptyPlace);

  const command = params.place_id? 'place' : params.popup_place_id? 'popup' : params.edit_place_id? 'edit' : params.code? 'move' : params.command;
  const place_id = params.place_id || params.popup_place_id || params.edit_place_id;

  useEffect(() => { // Load Place
    if (!mapList) setMapList(map_std_options.filter(entry => !entry.logged_in || identity));
  }, []);

  const mapSelected= activeMap ? mapList.find(e => e.id==activeMap) : false;

  useEffect(() => { // Load Place
    if (place_id) {
      if (place && place.id === place_id) return;
      setPlace(false);
      setSaving(true);
      console.log('Loading Place');
      api().get(`/api/v1/places/${place_id}`,
      ).then(response => {
        console.log(response.data);
        setPlace(response.data) ;
        if (command=='edit')
          setNewPlace(response.data);
        if (command==='edit')
          setMapCommand({
            goToCoordinates: [response.data.lng, response.data.lat ],
            goToZoom: 16,
          });
        dispatch(fetchStatus(response.data.status_id));
        setSaving(false);
      }).catch(error => {
        console.log(error);
        setPlace(false) ;
        setSaving(false);
      });
    } else {
      setPlace(false);
    }
  }, [place_id]);

  // Watcher for Rourtes
  useEffect(() => {
    if (command=== 'edit'&&!step) {
      setStep('coordinates');
      setNewPlace(place);
      setMapCommand({
        goToCoordinates: [place.lng, place.lat ],
        //setMarker: [place.lng, place.lat ],
        goToMinZoom: 15,
        timestamp: Date.now(),
        force: true,
      });
    }

    if (command==='new') {
      if (!step)
        setStep('coordinates');
    }

    if (!command||command==='place')
      setStep(false);
  }, [command, step]);

  // Watcher for ersten geladenen platz
  useEffect(() => {
    if (firstPageView&&place) {
      setMapCommand({
        goToCoordinates: [place.lng, place.lat],
        goToZoom: 15,
      });
      setFirstPageView(false);
    }

  }, [place]);

  const onSavePlace  = () => {
    setSaving(true);
    if (command=='new') {
      api().post( '/api/v1/places', {
        place: newPlace,
      }).then(response => {
        setSaving(false);
        setPlace(response.data);
        dispatch(fetchStatus(response.data.status_id));
        setNewPlace(EmptyPlace);
        setIsError (false);
        setStep(false);
        setPlaceCreated(true);
        setReloadSource(Date.now());
        router.history.replace('/geo/t/' + response.data.id);
      }).catch(error => {
        setSaving(false);
        setIsError (error);
      });
    } else {
      api().put( '/api/v1/places/' + newPlace.id, {
        place: newPlace,
      }).then(response => {
        setSaving(false);
        setPlace(response.data);
        dispatch(fetchStatus(response.data.status_id));
        setIsError (false);
        setStep(false);
        if (command==='new') {
          setPlaceCreated(true);
        }
        setReloadSource(Date.now());
        router.history.replace('/geo');
      }).catch(error => {
        setSaving(false);
        setIsError (error);
      });
    }
  };

  function onNewButton () {
    setStep('coordinates');
    setNewPlace(EmptyPlace);
    setMapCommand({
      goToMinZoom: 15,
    });
    router.history.push('/geo/new');
  }

  function onCoordButton () {
    setStep('data');
    console.log('NEWPLACE', newPlace);

  }

  const updateMap = (id, direct_input=false) => {

    setActiveMap(id);
    var sourceid=false;
    if (direct_input)
      sourceid=direct_input;
    else
      sourceid = (mapList||map_std_options).find(option => option.id == id);
    console.log(sourceid);
    /*
    setMapSource({
      'type': 'geojson',
      cluster: false, // Enable clustering
      clusterRadius: 10, // Radius of each cluster when clustering points
      clusterMaxZoom: 3,
      'data': sourceid.url,
    });*/
    let newSource =  sourceid.url;
    if (identity.signedIn && sourceid.logged_in) {
      newSource = newSource +  identity.accountId
    }
    setMapSource(newSource);
  };

  function onPostButton () {
    setPlaceCreated(false);
    if (place && !place.visit) {
      api().post(`/api/v1/places/${place.id}/add_visit`,
      ).then( response => {
        setPlace((prevalue) => {
          return {
            ...prevalue,
            visit: true,
          };
        });
      })
        .catch(error => {
          console.log(error);
        });
    }

  }

  const openPlace = (id) => {
    router.history.push('/geo/t/' + id);
  };

  const backClick =  () => {
    router.history.replace('/geo');
  };

  const onPlaceFormChange = (event) => {
    let value = event.target.value;
    let name = event.target.name;

    setNewPlace((prevalue) => {
      return {
        ...prevalue,
        [name]: value,
      };
    });
  };
  const setMarkerCoords  = (coords) => {
    console.log('new marker coords', coords);
    setNewPlace((prevalue) => {
      return {
        ...prevalue,
        lng: coords[0],
        lat: coords[1],
      };
    });
  };

  const handleBackButton = () => {
    if (step=='data')
      setStep('coordinates');
    else
      router.history.goBack();
  };

  const switchMapStyle = () => {
    setMapStyle(mapStyle == 0 ? 1 : 0);
  };

  const handleActiveMap = (e) => {
    updateMap(e.target.value);
  };

  const MyBackButton = () =>
    (<button onClick={handleBackButton} className='column-header__back-button'>
      <Icon id='chevron-left' className='column-back-button__icon' fixedWidth />
      <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
    </button>);


  // MOVE
  useEffect(() => {
    if (command=== 'move') {
      setIsLoading(true);
      api().put('/api/v1/geobla_move',
        {  geoUser: { userdata: { token: params.code } } }
      ).then(response => {
        console.log(response.data);
        if (response.data.success)
          setIsLoading("success");
        else
          setIsLoading("wait");
      }).catch(error => {
        console.log(error);
        setIsLoading('error');
      });
    }
  }, []);

    // ----- END MOVE

  if (command !== 'move')
  return(
    <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.heading)}>

      <ColumnHeader
        title={intl.formatMessage(messages.heading)}
        icon='map' multiColumn={multiColumn}
        extraButton={(typeof command !== 'undefined'&&!saving)&&(<button onClick={handleBackButton} className='column-header__back-button'>
          <Icon id='chevron-left' className='column-back-button__icon' fixedWidth />
          <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
        </button>)}
        showBackButton={false}
      />
      <div className='map-wrap'>
        <MapView
          showMarker={step === 'coordinates'}
          initMarker={(step === 'coordinates' && command === 'edit') ? [newPlace.lng, newPlace.lat] : false}
          showPopup={(command==='popup'&&place)&&place}
          allowBackClick={!step}
          {...{ setMarkerCoords, mapSource, openPlace, backClick, command,
            mapCommand, reloadSource, mapStyle }}
        >

          <div className='geo-map-button'>
            <div className={'map_style'}>
              <button id='replay' onClick={switchMapStyle} >
                <Icon id='globe' className='map-button-icon'  />
              </button>
            </div>
          </div>

          {!command &&
            <div className='geo-button-wrapper'>
              <NewPlaceButton
                {...{ onNewButton }}
              />
              <div className={'geo-switch-data'}>
                <GeoSelect
                  intl={intl}
                  placeholder={false}
                  className={'geo-switcher'}
                  name={'place_type'}
                  options={mapList}
                  value={activeMap}
                  handleChange={handleActiveMap}
                  icon={false}
                  isSuccess
                />

              </div>
            </div>
          }
          {step==='coordinates'&&
            <ChooseCoords
              {...{ onCoordButton }}
            /> }
          {step==='data'&&
            <PlaceForm
              {...{ onSavePlace, newPlace, onPlaceFormChange, saving, intl, isError }}
            /> }
          {command==='place'&&
            <Place
              {...{ onPostButton, intl, place, router, placeCreated, identity }}
            /> }
        </MapView>

      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>);
  else return (
    <Column bindToDocument={!multiColumn} label={'intl.formatMessage(messages.heading)'}>

      <ColumnHeader
        title={'Transfer posts'}
        icon='map' multiColumn={multiColumn}
        showBackButton={true}
      />
      {identity.signedIn ?
        <div className='empty-column-indicator'>
          { (isLoading === true) &&
            <LoadingIndicator />
          }
          { (isLoading === 'success') &&
            <span className='positive-hint'>
           <FormattedMessage id='geo.map.move_success' defaultMessage='Success, we will move your data' />
          </span>
          }
          { (isLoading === 'wait') &&
            <span className='positive-hint'>
           <FormattedMessage id='geo.map.move_done' defaultMessage='Please wait, we are currently moving your data' />
          </span>
          }
          { (isLoading === 'error') &&
            <span className='positive-hint'>
           <FormattedMessage id='geo.map.move_error' defaultMessage='There was a problem with your link.' />
          </span>
          }
          </div>
        : <NotSignedInIndicator/>}
    </Column>
  )
};
