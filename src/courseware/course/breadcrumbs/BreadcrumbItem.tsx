import React, { useState } from 'react';
import {
  useToggle,
  ModalPopup,
  Menu,
  Button,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { useIsPreview } from '@src/courseware/data/apiHooks';
import { getCoursewarePath } from '@src/courseware/urls';
import JumpNavMenuItem from '../JumpNavMenuItem';

interface Props {
  content: {
    default: boolean;
    id: string;
    label: string;
    sequences: {
      id: string;
    }[];
  } [];
  withSeparator: boolean | false;
  separator: string | '';
  courseId: string;
  sequenceId: string | '';
  unitId: string | '';
  isStaff: boolean | false;
  // Whether staff get the jump navigation menu, the breadcrumbs widget's `jumpNav` option.
  jumpNav?: boolean;
}

const BreadcrumbItem: React.FC<Props> = ({
  content,
  withSeparator,
  separator,
  courseId,
  sequenceId,
  unitId,
  isStaff,
  jumpNav = false,
}) => {
  const defaultContent = content.find(
    (destination: { default: boolean }) => destination.default,
  ) ?? { id: courseId, label: '', sequences: [] };

  const showRegularLink = !jumpNav || content.length < 2 || !isStaff;
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);

  const isPreview = useIsPreview();
  const link = getCoursewarePath(
    isPreview,
    courseId,
    defaultContent.sequences.length ? defaultContent.sequences[0].id : defaultContent.id,
  );
  return (
    <>
      {withSeparator && separator && (
        <li className="col-auto p-0 mx-2 text-primary-500 text-truncate text-nowrap" role="presentation" aria-hidden>{separator}</li>
      )}

      <li
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        data-testid="breadcrumb-item"
      >
        {showRegularLink ? (
          <Link
            className="text-primary-500"
            to={link}
          >
            {defaultContent.label}
          </Link>
        ) : (
          <>
            <Button className="text-primary-500 m-0 p-0" variant="link" onClick={open} ref={setTarget}>
              {defaultContent.label}
            </Button>
            <ModalPopup positionRef={target} isOpen={isOpen} onClose={close}>
              <Menu>
                {content.map((item) => (
                  <JumpNavMenuItem
                    key={item.label}
                    isDefault={item.default}
                    sequences={item.sequences}
                    courseId={courseId}
                    title={item.label}
                    currentSequence={sequenceId}
                    currentUnit={unitId}
                    onClick={close}
                  />
                ))}
              </Menu>
            </ModalPopup>
          </>
        )}
      </li>
    </>
  );
};

export default BreadcrumbItem;
