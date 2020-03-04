/* eslint-disable no-use-before-define */
import React, { useEffect, useContext, Suspense } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../PageLoading';
import messages from './messages';
import AlertList from '../../user-messages/AlertList';
import UserMessagesContext from '../../user-messages/UserMessagesContext';

const ContentLock = React.lazy(() => import('./content-lock'));

function Sequence({
  courseUsageKey,
  unitIds,
  displayName,
  showCompletion,
  onNext,
  onPrevious,
  onNavigateUnit,
  isGated,
  prerequisite,
  activeUnitId,
  bannerText,
  intl,
}) {
  const handleNext = () => {
    const nextIndex = unitIds.indexOf(activeUnitId) + 1;
    if (nextIndex < unitIds.length) {
      const newUnitId = unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    const previousIndex = unitIds.indexOf(activeUnitId) - 1;
    if (previousIndex >= 0) {
      const newUnitId = unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      onPrevious();
    }
  };

  const handleNavigate = (unitId) => {
    onNavigateUnit(unitId);
  };

  const { add, remove } = useContext(UserMessagesContext);
  useEffect(() => {
    let id = null;
    if (bannerText) {
      id = add({
        code: null,
        dismissible: false,
        text: bannerText,
        type: 'info',
        topic: 'sequence',
      });
    }
    return () => {
      if (id) {
        remove(id);
      }
    };
  }, [bannerText]);


  return (
    <>
      <div className="container-fluid">
        <AlertList topic="sequence" className="mt-3" />
        <SequenceNavigation
          className="mb-3"
          onNext={handleNext}
          onNavigate={handleNavigate}
          onPrevious={handlePrevious}
          unitIds={unitIds}
          activeUnitId={activeUnitId}
          isLocked={isGated}
          showCompletion={showCompletion}
        />
        {isGated && (
          <Suspense
            fallback={(
              <PageLoading
                srMessage={intl.formatMessage(messages['learn.loading.content.lock'])}
              />
            )}
          >
            <ContentLock
              courseUsageKey={courseUsageKey}
              sectionName={displayName}
              prereqSectionName={prerequisite.name}
              prereqId={prerequisite.id}
            />
          </Suspense>
        )}
      </div>
      <div className="flex-grow-1">
        {!isGated && (
          <Unit
            key={activeUnitId}
            id={activeUnitId}
          />
        )}
      </div>
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center mx-auto my-4"
          style={{ maxWidth: '1024px' }}
        >
          <Button
            className="btn-outline-secondary previous-button w-25 mr-2"
            onClick={handlePrevious}
          >
            <FormattedMessage
              id="learn.sequence.navigation.after.unit.previous"
              description="The button to go to the previous unit"
              defaultMessage="Previous"
            />
          </Button>
          <Button
            className="btn-outline-primary next-button w-75"
            onClick={handleNext}
          >
            <FormattedMessage
              id="learn.sequence.navigation.after.unit.next"
              description="The button to go to the next unit"
              defaultMessage="Next"
            />
          </Button>
        </div>
      </div>
    </>
  );
}

Sequence.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isGated: PropTypes.bool.isRequired,
  onNavigateUnit: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  prerequisite: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  bannerText: PropTypes.string,
};

Sequence.defaultProps = {
  onNavigateUnit: null,
  bannerText: undefined,
};

export default injectIntl(Sequence);
