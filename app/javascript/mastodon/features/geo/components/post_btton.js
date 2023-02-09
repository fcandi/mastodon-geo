import React from 'react';
import { connect } from 'react-redux';
import { defaultMediaVisibility, textForScreenReader } from '../../../components/status';
import { makeGetStatus, makeGetPictureInPicture } from '../../../selectors';
import {
  replyCompose,
  mentionCompose,
  directCompose,
} from '../../../actions/compose';
import {
  reblog,
  favourite,
  bookmark,
  unreblog,
  unfavourite,
  unbookmark,
  pin,
  unpin,
} from '../../../actions/interactions';
import {
  muteStatus,
  unmuteStatus,
  deleteStatus,
  hideStatus,
  revealStatus,
  toggleStatusCollapse,
  editStatus,
  translateStatus,
  undoStatusTranslation,
} from '../../../actions/statuses';
import {
  unmuteAccount,
  unblockAccount,
} from '../../../actions/accounts';
import {
  blockDomain,
  unblockDomain,
} from '../../../actions/domain_blocks';
import {
  initAddFilter,
} from '../../../actions/filters';
import { initMuteModal } from '../../../actions/mutes';
import { initBlockModal } from '../../../actions/blocks';
import { initBoostModal } from '../../../actions/boosts';
import { initReport } from '../../../actions/reports';
import { openModal } from '../../../actions/modal';
import { deployPictureInPicture } from '../../../actions/picture_in_picture';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { boostModal, deleteModal } from '../../../initial_state';
import { showAlertForError } from '../../../actions/alerts';
import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import StatusActionBar from '../../../components/status_action_bar';
import Button from '../../../components/button';

const messages = defineMessages({
  edited: { id: 'status.edited', defaultMessage: 'Edited {date}' },
  postNew: { id: 'geo.place.postnew', defaultMessage: 'Next: Post' },
  post: { id: 'geo.place.post', defaultMessage: 'Post here' },
});

// ausgehölter Status

class PlaceStatus extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
    identity: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    relationship: ImmutablePropTypes.map,
    buttonText: ImmutablePropTypes.map,
    newRoute:  PropTypes.string,
  };

  updateOnProps = [
    'status',
    'account',
  ];

  handleReplyClick = () => {
    const { signedIn } = this.context.identity;
    if (signedIn){
      this.props.onPostButton();
      this.props.onReply(this.props.status, this.context.router.history);
    } else {
      this.props.onInteractionModal('reply', this.props.status);
    }
  }
  render () {
    let { status, account, ...other } = this.props;
    if (status === null) {
      return null;
    }

    return (
        <Button className='button' onClick={this.handleReplyClick}>
          {this.props.children}
        </Button>
    );
  }
}


const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();
  const getPictureInPicture = makeGetPictureInPicture();

  const mapStateToProps = (state, props) => ({
    status: getStatus(state, props),
    pictureInPicture: getPictureInPicture(state, props),
  });
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl, contextType }) => ({

  onReply (status, router) {
    dispatch((_, getState) => {
      let state = getState();
        dispatch(replyCompose(status, router));
    });
  }

});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(PlaceStatus));
