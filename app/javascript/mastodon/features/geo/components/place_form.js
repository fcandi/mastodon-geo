import IconButton from '../../../components/icon_button';
import Button from '../../../components/button';
import React from 'react';
import { placeOptions } from '../config';
import { defineMessages, FormattedMessage } from 'react-intl';
import Status from '../../status';
import PostButton from './post_btton';



export const PlaceForm = (props) => {

  const {
    saving, onSavePlace, newPlace, onPlaceFormChange: submitChange,
    intl, isError
  } = props;

  const placeNameOK = newPlace.placename.length > 5;



  const messages = defineMessages({
    choose: { id: 'geo.place_type.choose', defaultMessage: 'geo.place_type.choose' },
    free: { id: 'geo.place_type.free', defaultMessage: 'Free Parking' },
    air: { id: 'geo.place_type.air', defaultMessage: 'Payed Parking' },
    wild: { id: 'geo.place_type.wild', defaultMessage: 'Wild Spot' },
    camp: { id: 'geo.place_type.camp', defaultMessage: 'Campsite' },
    placetype:  { id: 'geo.placetype', defaultMessage: 'Type' },
    placename:  { id: 'geo.placename', defaultMessage: 'Place Name' },
  });


console.log(intl.formatMessage(messages['free']));

  const handleChange = (e) => {
    submitChange(e);
  };

  return (
    <form  key={'wefwef'} className={'map-form'}>
      <div  >
        <FormattedMessage
          key='1'
          id={'geo.new_data'}
          defaultMessage={'Enter Infos'}
        />
      </div>
      <div className='place-form-field' >
        <label>
          {intl.formatMessage(messages.placename)}
          <input
            key='placeName'
            disabled={saving}
            className='setting-text'
            value={newPlace.placename}
            onChange={handleChange}
            name={'placename'}
          />
        </label>
        <IconButton
          key='submit'
          disabled
          active={placeNameOK}
          icon='check'
          title={'sdfsdfdf'}

        />
      </div>
      <div className='place-form-field' >
        <label>
          {intl.formatMessage(messages.placetype)}
          <select
            key='placeName'
            className='setting-text'
            value={newPlace.placetype}
            onChange={handleChange}
            name={'placetype'}
            disabled={saving}
          >
            <option value='' disabled>{intl.formatMessage(messages.choose)}</option>
            {placeOptions.map((option) => {
              console.log('OPTION:',option.id);
              if (messages[option.id]) return(
                <option
                  key={option.id}
                  value={option.id}
                >{intl.formatMessage(messages[option.id])}
                </option>

              );
            })}
          </select>
        </label>
        <IconButton
          key='submit'
          disabled
          active={(newPlace.placetype!=='')}
          icon='check'
          title={'sdfsdfdf'}

        />
      </div>
      <div className='place-form-field' >
        {saving ?
          <Button
            className='button'
            onClick={onSavePlace}
            disabled
          >
            <FormattedMessage
              id={'geo.wait'}
              defaultMessage={'Please wait'}
            />
          </Button>
          :
          <Button
            className='button'
            onClick={onSavePlace}
            disabled={(!newPlace.placetype||!placeNameOK)}
          >
            <FormattedMessage
              id={'geo.place_create'}
              defaultMessage={'Save Place'}
            />
          </Button>
        }
        {isError &&
          <div>
              ERROR: {isError.message}
          </div>
        }
      </div>
    </form>
  );
};

export const NewPlaceButton = ({onNewButton}) =>

  (<Button className='geo-button' onClick={onNewButton}>
    <FormattedMessage
      id={'geo.new_place'}
      defaultMessage={'Neuer platz'}
    />
  </Button>);

export const RegisterForAction = () =>
  ( <a href={'/auth/sign_up'}>
    <Button className='geo-button'>
    <FormattedMessage
      id={'geo.map.register'}
      defaultMessage={'Register for map features'}
    />
  </Button>
    </a>
  );
export const ChooseCoords = ({onCoordButton}) =>
  (<>
    <Button className='geo-button-center' onClick={onCoordButton}>
      <FormattedMessage
        id={'geo.new_coord'}
        defaultMessage={'Confirm Location'}
      />
    </Button>
  </>);

export const MyPostButton = ({id, router, newPlace,onPostButton }) => {
  const r = "/@Testuser/" + id;
  return (
    <PostButton id={id} newRoute={r} {...{router,onPostButton}}>
      {newPlace
        ?  <FormattedMessage
          id={'geo.place.post-new'}
          defaultMessage={'New Post here'}
        />
        : <FormattedMessage
          id={'geo.place.post'}
          defaultMessage={'Post here'}
        />
      }

    </PostButton>)
};
