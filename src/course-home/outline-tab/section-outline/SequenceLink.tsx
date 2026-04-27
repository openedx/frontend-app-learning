import React from 'react';
import classNames from 'classnames';

import SequenceDueDate from './SequenceDueDate';
import HiddenSequenceLink from './HiddenSequenceLink';
import SequenceTitle from './SequenceTitle';

interface Props {
  id: string;
  first: boolean;
  // Added showOutlineEstimatedTime prop to control whether to show the estimated time for sequences in the course outline
  showOutlineEstimatedTime?: boolean;
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
  // Default showOutlineEstimatedTime to true to maintain existing behavior of showing estimated time in the course outline,
  // but allow it to be turned off if needed (e.g. for a more simplified outline view).
  showOutlineEstimatedTime = true,
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

  // showOutlineEstimatedTime is passed down to the SequenceTitle component to control whether to show the estimated 
  // time for sequences in the course 
  return (
    <li>
      <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
        <SequenceTitle
          {...{
            complete,
            showLink,
            title,
            sequence,
            showOutlineEstimatedTime,
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
