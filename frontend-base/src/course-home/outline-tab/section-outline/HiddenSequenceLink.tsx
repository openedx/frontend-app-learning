import React from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { Block } from '@openedx/paragon/icons';

import messages from '../messages';

const HiddenSequenceLink: React.FC = () => {
  const intl = useIntl();

  return (
    <div className="row w-100 my-2 mx-4 pl-3">
      <span className="small d-flex">
        <Icon className="mr-2" src={Block} data-testid="hide-from-toc-sequence-link-icon" />
        <span data-testid="hide-from-toc-sequence-link-text">
          {intl.formatMessage(messages.hiddenSequenceLink)}
        </span>
      </span>
    </div>
  );
};

export default HiddenSequenceLink;
