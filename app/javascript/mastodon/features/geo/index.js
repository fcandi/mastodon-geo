import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { GeoIndex } from './geo_index';

export default @connect()
@injectIntl

class Geo extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
    identity: PropTypes.object,
  };

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
    onInteractionModal: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }
  render () {
    return (
      <GeoIndex
        router={this.context.router}
        identity={this.context.identity}
        {...this.props}
      />
    );
  }
}
