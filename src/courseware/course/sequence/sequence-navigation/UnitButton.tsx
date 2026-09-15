import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Button, Icon } from '@openedx/paragon';
import { Bookmark } from '@openedx/paragon/icons';

import { useModel } from '../../../../generic/model-store';
import type { RootState } from '../../../../store';
import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';

interface Props {
  onClick: (unitId: string) => void;
  unitId: string;
  title?: string;
  contentType?: string;
  isActive?: boolean;
  showCompletion?: boolean;
  showTitle?: boolean;
  className?: string;
}

const UnitButton = ({
  onClick,
  title: fallbackTitle,
  contentType: fallbackContentType,
  isActive = false,
  showCompletion = true,
  unitId,
  className,
  showTitle = false,
}: Props) => {
  const {
    title = fallbackTitle,
    contentType = fallbackContentType,
    bookmarked = false,
    complete = false,
  } = useModel('units', unitId);
  const { courseId, sequenceId } = useSelector((state: RootState) => state.courseware);
  const { pathname } = useLocation();
  const basePath = `/course/${courseId}/${sequenceId}/${unitId}`;
  const unitPath = pathname.startsWith('/preview') ? `/preview${basePath}` : basePath;

  const handleClick = useCallback(() => {
    onClick(unitId);
  }, [onClick, unitId]);

  return (
    <Button
      className={classNames({
        active: isActive,
        complete: showCompletion && complete,
      }, className)}
      variant="link"
      onClick={handleClick}
      title={title}
      as={Link}
      to={unitPath}
    >
      <UnitIcon type={contentType} />
      {showTitle && <span className="unit-title">{title}</span>}
      {showCompletion && complete ? <CompleteIcon size="sm" className="text-success ml-2" /> : null}
      {bookmarked ? (
        <Icon
          data-testid="bookmark-icon"
          src={Bookmark}
          className="text-primary small position-absolute"
          style={{ top: '-3px', right: '5px' }}
        />
      ) : null}
    </Button>
  );
};

export default UnitButton;
