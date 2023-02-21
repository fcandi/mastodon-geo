import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { MyPostButton } from './place_form';
import StatusThread from './status_thread';
import LoadingIndicator from '../../../components/loading_indicator';
import { EditButton, has_update_right, PlaceFav, PlaceType, PlaceVisit, update_right } from './elements';
import { placeOptions } from '../config';

export const Place = (props) => {



  const {
    onPostButton, intl, id, place, router, placeCreated, identity,
  } = props;

  const messages = defineMessages({
    choose: { id: 'geo.place_type.choose', defaultMessage: 'geo.place_type.choose' },
    free: { id: 'geo.place_type.free', defaultMessage: 'Free Parking' },
    air: { id: 'geo.place_type.air', defaultMessage: 'Payed Parking' },
    wild: { id: 'geo.place_type.wild', defaultMessage: 'Wild Spot' },
    camp: { id: 'geo.place_type.camp', defaultMessage: 'Campsite' },
  });

  const update_right = place && has_update_right(identity, place);

  const goBack = () => {
    router.history.push('/geo');
  };
  console.log(router.route?.location?.hash);
  const NewBox = () =>
    (<div className={'new-box'}>
      <FormattedMessage
        id={'geo.place.post_descr'}
        defaultMessage={'Confirm Location'}
      />
      <div style={{ marginTop: 7 }}>
        <MyPostButton id={place.status_id} newPlace {...{ router, onPostButton }} />
      </div>

    </div>);

  const PlaceActions = () =>
    (<div className={"place-button-list"}>

      <PlaceVisit {...{ place }} />
      <PlaceFav {...{ place }} />
      {update_right&&
      <EditButton onClick={()=>router.history.push('/geo/edit/'+place.id)}/>}
    </div>);
  const PlaceBox = ({ postButton }) =>
    (
      <div className={'place-box'}>
        {place.placename}
        <PlaceType {...{ place }} />
        <PlaceActions />
        {postButton&&
          <div style={{ marginTop: 7 }}>
            <MyPostButton id={place.status_id} {...{ router, onPostButton }} />
          </div>    }
      </div>
    );

  if (!place) return (
    <div className='place-wrap' >
      <LoadingIndicator />
    </div>
  ); else return (
    <>

      <div className={'place-wrap'}>
        {placeCreated&&
          <NewBox />}
        <PlaceBox postButton={!placeCreated} />
        <StatusThread
          statusId={place.status_id}
        />

      </div>

    </>
  );
};
