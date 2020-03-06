/* eslint-disable no-use-before-define */
import React, {
  useEffect, useContext, Suspense, useState,
} from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@edx/paragon';

import Unit from './Unit';
import SequenceNavigation from './SequenceNavigation';
import PageLoading from '../PageLoading';
import messages from './messages';
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

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };
  useEffect(() => {
    setUnitHasLoaded(false);
  }, [activeUnitId]);

  return (
    <>
      <SequenceNavigation
        className="mb-4"
        onNext={handleNext}
        onNavigate={handleNavigate}
        onPrevious={handlePrevious}
        unitIds={unitIds}
        activeUnitId={activeUnitId}
        isLocked={isGated}
        showCompletion={showCompletion}
      />
      <div className="flex-grow-1">
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
        {!isGated && (
          <Unit
            key={activeUnitId}
            id={activeUnitId}
            onLoaded={handleUnitLoaded}
          />
        )}
      </div>
      {unitHasLoaded ? (
        <div className="unit-content-container below-unit-navigation">
          <Button
            className="btn-outline-secondary previous-button w-25 mr-2"
            onClick={handlePrevious}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
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
            <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
          </Button>
        </div>
      ) : null}
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
