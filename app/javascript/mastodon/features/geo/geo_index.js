import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import { MapView } from './components/map';
import { Helmet } from 'react-helmet';
import React, { Component, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import api from '../../api';
import { fetchStatus } from '../../actions/statuses';
import { ChooseCoords, NewPlaceButton, PlaceForm, PostForm } from './components/place_form';
import { Place } from './components/place';

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

  const { multiColumn, intl, router, dispatch, params } = props;
  const [saving, setSaving] =  useState(false);
  const [isError, setIsError] =  useState(false);
  const [place, setPlace] =  useState(false);
  const [mapSource, setMapSource] =  useState('/api/v1/places/json_all');
  const [newPlace, setNewPlace] = useState(EmptyPlace);

  const step = params.place_id ? 'place' : params.command;
  const place_id = params.place_id;

  useEffect(() => { // init map at mount
    if (place_id) {
      setSaving(true);
      console.log('Loading Place');
      api().get(`/api/v1/places/${place_id}`,
      ).then(response => {
        console.log(response.data);
        setPlace(response.data) ;
        dispatch(fetchStatus(response.data.status_id));
        setSaving(false);
      }).catch(error => {
        console.log(error);
        setPlace(false) ;
        setSaving(false);
      });
    }
  }, [place_id]);

  // Watcher for Rourtes
  useEffect(() => { // back to start when opened with data url
    if (step=='data'&&!newPlace.lat)
      router.history.replace('/geo');
  }, [step]);

  const onSavePlace  = () => {
    setSaving(true);
    api().post('/api/v1/places', {
      place: newPlace,
    }).then(response => {
      setSaving(false);
      console.log(response.data);
      setPlace(response.data);
      dispatch(fetchStatus(response.data.status_id));
      setNewPlace(EmptyPlace);
      setIsError (false);
      router.history.replace('/geo/post');
    }).catch(error => {
      setSaving(false);
      console.log(error);
      setIsError (error);
    });
  };

  function onNewButton () {
    router.history.push('/geo/new');
  }

  function onCoordButton () {
    router.history.push('/geo/data');
  }

  function onPostButton () {
    onPost();
  }
  function onDataButton (e) {
    e.preventDefault();
    router.history.push('/geo/create');
  }
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
    setNewPlace((prevalue) => {
      return {
        ...prevalue,
        lng: coords[0],
        lat: coords[1],
      };
    });
  };

  return(
    <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.heading)}>

      <ColumnHeader
        title={intl.formatMessage(messages.heading)}
        icon='map' multiColumn={multiColumn}
        showBackButton={(typeof step !== 'undefined'&&!saving)}
      />


      <div className='map-wrap'>
        <MapView
          showMarker={step === 'new'}
          startCoords={[139.753, 35.6844]}
          {...{ setMarkerCoords, mapSource }}
        >
          <div className='map-form'>
            {!step&&
            <NewPlaceButton
              {...{ onNewButton }}
            /> }
            {step==='new'&&
            <ChooseCoords
              {...{ onCoordButton }}
            /> }
            {step==='data'&&
            <PlaceForm
              {...{ onSavePlace, newPlace, onPlaceFormChange, saving, intl, isError }}
            /> }
            {step==='place'&&
            <Place
              {...{ onPostButton, intl, place, router }}
            /> }
            {step==='post'&&
              <PostForm
                {...{ place,router }}
              /> }
          </div>
        </MapView>
      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>);
};
