import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge, Button, ModalPopup, useToggle,
} from '@openedx/paragon';
import { ArrowDropDown } from '@openedx/paragon/icons';
import { generatePath, Link } from 'react-router-dom';

import { DECODE_ROUTES } from '@src/constants';

import type { PathwayData } from '../data/types';
import messages from './messages';

export const MorePathwaysPopover = ({ pathways }: { pathways: PathwayData[] }) => {
  const { formatMessage } = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Button
        ref={setTarget}
        variant="inverse-tertiary"
        size="sm"
        iconAfter={ArrowDropDown}
        className="course-pathways-strip-trigger ml-auto pl-2"
        aria-label={formatMessage(messages.morePathways, { count: pathways.length })}
        onClick={open}
      >
        <Badge pill variant="light">{pathways.length}</Badge>
      </Button>
      <ModalPopup
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        placement="bottom-end"
        withPortal
      >
        <div className="bg-white px-4 py-3 rounded shadow small">
          <ul className="mb-0 pl-3">
            {pathways.map((pathway) => (
              <li key={pathway.pathway.id}>
                <Link to={generatePath(DECODE_ROUTES.PATHWAY_OUTLINE, { pathwayId: pathway.pathway.id })}>
                  {pathway.pathway.content.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </ModalPopup>
    </>
  );
};
