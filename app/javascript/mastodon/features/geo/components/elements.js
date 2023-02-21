import React, { useState } from 'react';
import { PERMISSION_MANAGE_REPORTS, PERMISSION_MANAGE_USERS } from '../../../permissions';
import api from '../../../api';
import { fetchStatus } from '../../../actions/statuses';
import { placeOptions } from '../config';
import classNames from 'classnames';
import Icon from '../../../components/icon';
import { intlFormatPropTypes as intl } from 'react-intl/src/types';
import { defineMessages, FormattedMessage } from 'react-intl';



export const PlaceType = ({place}) => {

  const symbol = placeOptions.filter ( el => el.id==place.placetype);

  return (<div>
    <img src={'/geo/' + symbol[0].id + '.png'} width={15}/>
    {place.placetype}
  </div>)
}

export const PlaceFav = ({place}) => {
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
    <button onClick={toggle} className={classNames({
      'place-button': true,
      'place-button-active': activated,
    })}>
      <Icon id='star' className='place-icon' />
      <FormattedMessage
        id={'geo.favorite'}
        defaultMessage={'Favorite'}
      />
    </button>);
}

export const PlaceVisit = ({place}) => {
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
    <button onClick={toggle} className={classNames({
      'place-button': true,
      'place-button-active': activated,
    })}>
      <Icon id='check' className='place-icon'  />
      <FormattedMessage
        id={'geo.visited'}
        defaultMessage={'Visited'}
      />
      </button>);
}

export const EditButton = ({onClick}) => {
  return (
    <button onClick={onClick} className={'place-button place-button-active'}>
      <Icon id='pencil' className='place-icon'/>
      <FormattedMessage
        id={'geo.edit'}
        defaultMessage={'Edit'}
      />
    </button>);
};

export function create_right(user) {
    if (user) return true;
}

export function has_update_right(identity,place) {
  //return ( identity.accountId==place.account_id || ((identity.permissions & PERMISSION_MANAGE_REPORTS) === PERMISSION_MANAGE_REPORTS));
  return ( identity.accountId==place.account_id );
}
