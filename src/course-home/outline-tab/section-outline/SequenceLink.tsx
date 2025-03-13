import React from 'react';
import classNames from 'classnames';

import SequenceDueDate from './SequenceDueDate';
import HiddenSequenceLink from './HiddenSequenceLink';
import SequenceTitle from './SequenceTitle';

interface Props {
  id: string;
  first: boolean;
  sequence: {
    complete: boolean;
    description: string;
    due: string;
    showLink: boolean;
    title: string;
    hideFromTOC: boolean;
  }
}

const SequenceLink: React.FC<Props> = ({
  id,
  first,
  sequence,
}) => {
  const {
    complete,
    description,
    due,
    showLink,
    title,
    hideFromTOC,
  } = sequence;

  return (
    <li>
      <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
        <SequenceTitle
          {...{
            complete,
            showLink,
            title,
            sequence,
            id,
          }}
        />
        {hideFromTOC && (
          <HiddenSequenceLink />
        )}
        <SequenceDueDate {...{ due, id, description }} />
      </div>
    </li>
  );
};

export default SequenceLink;
