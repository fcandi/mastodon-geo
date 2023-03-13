import React from 'react';
import { connect } from 'react-redux';
import { makeGetStatus, makeGetPictureInPicture } from '../../../selectors';
import {
  replyCompose,
} from '../../../actions/compose';
import { injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Button from '../../../components/button';

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
    onInteractionModal: PropTypes.func,
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
  };
  render () {
    let { status } = this.props;
    if (status === null) {
      return null;
    }

    return (
      // eslint-disable-next-line react/jsx-filename-extension
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
  },

});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(PlaceStatus));
