import React, { useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  useToggle,
  ModalPopup,
  Menu,
} from '@openedx/paragon';
import { Link, useLocation } from 'react-router-dom';
import JumpNavMenuItem from '../JumpNavMenuItem';

interface Props {
  content: {
    default: boolean,
    id: string,
    label: string,
    sequences: {
      id: string,
    }[],
  } [];
  withSeparator: boolean | false,
  separator: string | '';
  courseId: string;
  sequenceId: string | '';
  unitId: string | '';
  isStaff: boolean | false;
}

const BreadcrumbItem: React.FC<Props> = ({
  content,
  withSeparator,
  separator,
  courseId,
  sequenceId,
  unitId,
  isStaff,
}) => {    
  const defaultContent = content.filter(
    (destination: { default: boolean }) => destination.default,
  )[0] || { id: courseId, label: '', sequences: [] };

  const showRegularLink = getConfig().ENABLE_JUMPNAV !== 'true' || content.length < 2 || !isStaff;
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const { pathname } = useLocation();
  const isPreview = pathname.startsWith('/preview');
  const baseUrl = defaultContent.sequences.length
    ? `/course/${courseId}/${defaultContent.sequences[0].id}`
    : `/course/${courseId}/${defaultContent.id}`;
  const link = isPreview ? `/preview${baseUrl}` : baseUrl;
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
            {
              // @ts-ignore
              <a className="text-primary-500" variant="link" onClick={open} ref={setTarget}>
                {defaultContent.label}
              </a>
            }
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