import { useCallback } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Icon } from '@openedx/paragon';
import { Bookmark } from '@openedx/paragon/icons';

import { useUnit } from '../../../data/apiHooks';
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
  const { courseId, sequenceId } = useParams();
  const unit = useUnit(sequenceId, unitId).data;
  const title = unit?.title ?? fallbackTitle;
  const contentType = unit?.contentType ?? fallbackContentType;
  const bookmarked = unit?.bookmarked ?? false;
  const complete = unit?.complete ?? false;
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
