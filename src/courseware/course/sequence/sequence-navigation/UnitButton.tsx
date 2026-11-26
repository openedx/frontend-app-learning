import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Icon } from '@openedx/paragon';
import { Bookmark } from '@openedx/paragon/icons';

import { useIsPreview, useUnit } from '@src/courseware/data/apiHooks';
import { useCourseId, useSequenceId } from '@src/generic/course-params';
import { getCoursewarePath } from '@src/courseware/urls';
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
  const courseId = useCourseId();
  const sequenceId = useSequenceId();
  const unit = useUnit(sequenceId, unitId).data;
  const title = unit?.title ?? fallbackTitle;
  const contentType = unit?.contentType ?? fallbackContentType;
  const bookmarked = unit?.bookmarked ?? false;
  const complete = unit?.complete ?? false;
  const isPreview = useIsPreview();
  // The unit buttons render on the courseware routes only, which all have both ids.
  const unitPath = getCoursewarePath(isPreview, courseId, sequenceId!, unitId);

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
