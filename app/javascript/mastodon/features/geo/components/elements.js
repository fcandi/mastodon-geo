import React, { useState } from 'react';
import { PERMISSION_MANAGE_REPORTS, PERMISSION_MANAGE_USERS } from '../../../permissions';
import api from '../../../api';
import { fetchStatus } from '../../../actions/statuses';
import { placeOptions } from '../config';
import classNames from 'classnames';
import Icon from '../../../components/icon';
import { intlFormatPropTypes as intl } from 'react-intl/src/types';
import { defineMessages, FormattedMessage } from 'react-intl';



export const PlaceType = ({ place }) => {

  const symbol = placeOptions.filter ( el => el.id==place.placetype);

  return (
    <div className={'my-tag'}>
      <div style={{ backgroundColor: symbol[0].color, padding: 1, paddingLeft: 6, paddingRight: 6, borderRadius: 6 }}>
        <img className={'map-place-button-icon'} src={'/geo/' + symbol[0].icon} width={13} />
        {place.placetype}
      </div>
    </div>);
};

export const PlaceFav = ({ place }) => {
  const [activated, setActivated] =  useState(place.fav);

  function toggle () {
    setActivated(!activated);
    let status=activated;
    api().post(`/api/v1/places/${place.id}/${activated ? 'remove_fav':'add_fav'}`,
    ).catch(error => {
      console.log(error);
      setActivated(status);
    });
  }

  return (
    <button
      onClick={toggle} className={classNames({
        'place-button': true,
        'place-button-active': activated,
      })}
    >
      <Icon id='star' className='place-icon' />
      <FormattedMessage
        id={'geo.favorite'}
        defaultMessage={'Favorite'}
      />
    </button>);
};

export const PlaceVisit = ({ place }) => {
  const [activated, setActivated] =  useState(place.visit);
  function toggle () {
    setActivated(!activated);
    let status=activated;
    api().post(`/api/v1/places/${place.id}/${activated ? 'remove_visit':'add_visit'}`,
    ).catch(error => {
      console.log(error);
      setActivated(status);
    });
  }

  return (
    <button
      onClick={toggle} className={classNames({
        'place-button': true,
        'place-button-active': activated,
      })}
    >
      <Icon id='check' className='place-icon'  />
      <FormattedMessage
        id={'geo.visited'}
        defaultMessage={'Visited'}
      />
    </button>);
};

export const EditButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={'place-button place-button-active'}>
      <Icon id='pencil' className='place-icon' />
      <FormattedMessage
        id={'geo.place.edit'}
        defaultMessage={'Edit'}
      />
    </button>);
};

export const PlaceNav = ({ place }) => {
  function navCall(lat, lng) {
    let coord = lat + "," + lng;
    if /* if we're on iOS, open in Apple Maps */
    ((navigator.platform.indexOf("iPhone") != -1) ||
      (navigator.platform.indexOf("iPad") != -1) ||
      (navigator.platform.indexOf("iPod") != -1))
      window.open("maps://maps.google.com/maps?daddr=" + coord + "&amp;ll=");
    else /* else use Google */
      window.open("https://maps.google.com/maps?daddr=" + coord + "&amp;ll=");
  }

  return (
    <button onClick={() => navCall(place.lat, place.lng)} className={'place-button'}>
      <Icon id='car' className='place-icon' />
      <FormattedMessage
        id={'geo.place.nav'}
        defaultMessage={'Navigieren'}
      />
    </button>);
};

export function create_right(user) {
  if (user) return true;
}

export function has_update_right(identity, place) {
  return ( identity.accountId==place.account_id || ((identity.permissions & PERMISSION_MANAGE_REPORTS) === PERMISSION_MANAGE_REPORTS));
  return ( identity.accountId==place.account_id );
}
const messages = defineMessages({
  map_all: { id: 'geo.map_all', defaultMessage: 'All Places' },
  map_my: { id: 'geo.map_my', defaultMessage: 'My Places' },
  map_like: { id: 'geo.map_like', defaultMessage: 'Favorites' },
  map_from: { id: 'geo.map_from', defaultMessage: 'Places from ' },
});

export const GeoSelect = (props) => {

  return (
    <select
      id={props.name}
      name={props.name}
      value={props.value}
      onChange={props.handleChange}
      className={props.className}
    >
      {props.placeholder && <option value='' disabled>{props.placeholder}</option>}
      {props.options.map((option) => {
        console.log(option);
        return(
          <option
            key={option.id}
            value={option.id}
          >
            {option.name && props.intl.formatMessage(messages[option.name]) }
          </option>

        );
      })}
    </select>
  );
};
