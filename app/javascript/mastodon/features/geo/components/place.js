import React from 'react';
import { placeOptions } from '../config';
import { defineMessages, FormattedMessage } from 'react-intl';
import PostButton from './post_btton';
import { MyPostButton } from './place_form';


export const Place = (props) => {

  const {
    onPostButton, intl, id, place, router
  } = props;

  const messages = defineMessages({
    choose: { id: 'geo.place_type.choose', defaultMessage: 'geo.place_type.choose' },
    free: { id: 'geo.place_type.free', defaultMessage: 'Free Parking' },
    air: { id: 'geo.place_type.air', defaultMessage: 'Payed Parking' },
    wild: { id: 'geo.place_type.wild', defaultMessage: 'Wild Spot' },
    camp: { id: 'geo.place_type.camp', defaultMessage: 'Campsite' },
  });



  return (
    <div className='place-form-field' >
      <MyPostButton id={place.status_id} {...{router}}/>
    </div>
  );
};
