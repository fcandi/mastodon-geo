import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defaultMediaVisibility } from '../../../components/status';
import { makeGetPictureInPicture, makeGetStatus } from '../../../selectors';
import { createSelector } from 'reselect';
import Immutable from 'immutable';
import StatusContainer from '../../../containers/status_container';
import classNames from 'classnames';
import { ScrollContainer } from 'react-router-scroll-4';
import ScrollableList from '../../../components/scrollable_list';

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();
  const getPictureInPicture = makeGetPictureInPicture();

  const getAncestorsIds = createSelector([
    (_, { id }) => id,
    state => state.getIn(['contexts', 'inReplyTos']),
  ], (statusId, inReplyTos) => {
    let ancestorsIds = Immutable.List();
    ancestorsIds = ancestorsIds.withMutations(mutable => {
      let id = statusId;

      while (id && !mutable.includes(id)) {
        mutable.unshift(id);
        id = inReplyTos.get(id);
      }
    });

    return ancestorsIds;
  });

  const getDescendantsIds = createSelector([
    (_, { id }) => id,
    state => state.getIn(['contexts', 'replies']),
    state => state.get('statuses'),
  ], (statusId, contextReplies, statuses) => {
    let descendantsIds = [];
    const ids = [statusId];

    while (ids.length > 0) {
      let id        = ids.pop();
      const replies = contextReplies.get(id);

      if (statusId !== id) {
        descendantsIds.push(id);
      }

      if (replies) {
        replies.reverse().forEach(reply => {
          if (!ids.includes(reply) && !descendantsIds.includes(reply) && statusId !== reply) ids.push(reply);
        });
      }
    }

    let insertAt = descendantsIds.findIndex((id) => statuses.get(id).get('in_reply_to_account_id') !== statuses.get(id).get('account'));
    if (insertAt !== -1) {
      descendantsIds.forEach((id, idx) => {
        if (idx > insertAt && statuses.get(id).get('in_reply_to_account_id') === statuses.get(id).get('account')) {
          descendantsIds.splice(idx, 1);
          descendantsIds.splice(insertAt, 0, id);
          insertAt += 1;
        }
      });
    }

    return Immutable.List(descendantsIds);
  });

  const mapStateToProps = (state, props) => {

    const status = getStatus(state, { id: props.statusId });

    let ancestorsIds   = Immutable.List();
    let descendantsIds = Immutable.List();

    if (status) {
      ancestorsIds   = getAncestorsIds(state, { id: status.get('in_reply_to_id') });
      descendantsIds = getDescendantsIds(state, { id: status.get('id') });
    }

    return {
      isLoading: state.getIn(['statuses', props.statusId, 'isLoading']),
      status,
      ancestorsIds,
      descendantsIds,
      askReplyConfirmation: state.getIn(['compose', 'text']).trim().length !== 0,
      domain: state.getIn(['meta', 'domain']),
      pictureInPicture: getPictureInPicture(state, { id: props.statusId }),
    };
  };

  return mapStateToProps;
};

export default @injectIntl
@connect(makeMapStateToProps)

class StatusThread extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
    identity: PropTypes.object,
  };

  static propTypes = {
    statusId: PropTypes.string,
    descendantsIds: ImmutablePropTypes.list,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  state = {
    fullscreen: false,
    showMedia: true,
    loadedStatusId: undefined,
  };
  constructor(props) {
    super(props);
  }
  render () {
    //console.log("DDD",descendantsIds)
    return (

<>


        <StatusContainer
          key={this.props.statusId}
          id={this.props.statusId}
          //ccount={'Testuser'}
          showThread
          //onMoveUp={this.handleMoveUp}
          //onMoveDown={this.handleMoveDown}
          //contextType={place.status_id}
          withCounters
        />
        {this.props.descendantsIds&& this.props.descendantsIds.map(id =>
          (<StatusContainer
            key={id}
            id={id}
            //ccount={'Testuser'}
            showThread
            //onMoveUp={this.handleMoveUp}
            //onMoveDown={this.handleMoveDown}
            //contextType={place.status_id}
            withCounters
          />),
        )}


</>
    );
  }


}
