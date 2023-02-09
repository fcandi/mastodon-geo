import React from 'react';
import { placeOptions } from '../config';
import { defineMessages, FormattedMessage } from 'react-intl';
import PostButton from './post_btton';
import { MyPostButton } from './place_form';
import StatusThread from './status_thread';
import LoadingIndicator from '../../../components/loading_indicator';
import { PlaceType } from './elements';
import Status_container from '../../../containers/status_container';
import StatusList from '../../../components/status_list';
import StatusContainer from '../../../containers/status_container';
import Status from '../../status';
import { ScrollContainer } from 'react-router-scroll-4';


export const Place = (props) => {

  const {
    onPostButton, intl, id, place, router, placeCreated
  } = props;

  const messages = defineMessages({
    choose: { id: 'geo.place_type.choose', defaultMessage: 'geo.place_type.choose' },
    free: { id: 'geo.place_type.free', defaultMessage: 'Free Parking' },
    air: { id: 'geo.place_type.air', defaultMessage: 'Payed Parking' },
    wild: { id: 'geo.place_type.wild', defaultMessage: 'Wild Spot' },
    camp: { id: 'geo.place_type.camp', defaultMessage: 'Campsite' },
  });


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
        <MyPostButton id={place.status_id} newPlace {...{ router,onPostButton }} />
      </div>

    </div>);

  const PlaceActions = () =>
    <div>
        <button>
          war hier
        </button>
      <button>
        favority
      </button>
      <button onClick={()=>router.history.push('/geo/edit/'+place.id)}>
        edit
      </button>
    </div>
  const PlaceBox = ({ postButton }) =>
    (
      <div className={'place-box'}>
        {place.placename}
        <PlaceType {...{ place }} />
        <PlaceActions/>
        {postButton&&
          <div style={{ marginTop: 7 }}>
            <MyPostButton id={place.status_id} {...{ router,onPostButton }} />
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
