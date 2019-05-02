import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import LoggingService from '@edx/frontend-logging';


const injectIntlWithShim = (WrappedComponent) => {
  class ShimmedIntlComponent extends React.Component {
    static propTypes = {
      intl: intlShape.isRequired,
    };

    constructor(props) {
      super(props);
      this.shimmedIntl = Object.create(this.props.intl, {
        formatMessage: {
          value: (definition) => {
            if (definition === undefined || definition.id === undefined) {
              const error = new Error('i18n error: An undefined message was supplied to intl.formatMessage.');
              if (process.env.NODE_ENV !== 'production') {
                console.error(error); // eslint-disable-line no-console
                return '!!! Missing message supplied to intl.formatMessage !!!';
              }
              LoggingService.logError(error);
              return ''; // Fail silent in production
            }
            return this.props.intl.formatMessage(definition);
          },
        },
      });
    }

    render() {
      return <WrappedComponent {...this.props} intl={this.shimmedIntl} />;
    }
  }

  return injectIntl(ShimmedIntlComponent);
};


export default injectIntlWithShim;
