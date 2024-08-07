import PropTypes from 'prop-types';
import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useModel } from '@src/generic/model-store';

import BookmarkButton from '../../bookmark/BookmarkButton';
import messages from '../messages';
import UnitContent from './UnitContent';
import UnitSuspense from './UnitSuspense';
import { modelKeys } from './constants';
import { useExamAccess, useShouldDisplayHonorCode } from './hooks';
import UnitTitleSlot from '../../../../plugin-slots/UnitTitleSlot';

const Unit = ({
  courseId,
  format,
  onLoaded,
  id,
}) => {
  const { formatMessage } = useIntl();
  const examAccess = useExamAccess({ id });
  const shouldDisplayHonorCode = useShouldDisplayHonorCode({ courseId, id });
  const unit = useModel(modelKeys.units, id);
  const isProcessing = unit.bookmarkedUpdateState === 'loading';

  const shouldShowContent = !shouldDisplayHonorCode && !examAccess.blockAccess;

  return (
    <div className="unit">
      <div className="mb-0">
        <h3 className="h3">{unit.title}</h3>
        <UnitTitleSlot courseId={courseId} unitId={id} unitTitle={unit.title} />
      </div>
      <h2 className="sr-only">{formatMessage(messages.headerPlaceholder)}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
      <UnitSuspense {...{ courseId, id }} />
      <br />
      { shouldShowContent ? <UnitContent unitId={id} /> : null }
    </div>
  );
};

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  format: PropTypes.string,
  id: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
};

Unit.defaultProps = {
  format: null,
  onLoaded: undefined,
};

export default Unit;
