import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import UnitButton from './UnitButton';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';
import {
  useIsOnXLDesktop, useIsOnMediumDesktop, useIsOnLargeDesktop, useIsSidebarOpen,
} from './hooks';

const SequenceNavigationTabs = ({
  unitIds, unitId, showCompletion, onNavigate,
}) => {
  const isSidebarOpen = useIsSidebarOpen(unitId);
  const [
    indexOfLastVisibleChild,
    containerRef,
    invisibleStyle,
  ] = useIndexOfLastVisibleChild(isSidebarOpen);
  const isOnXLDesktop = useIsOnXLDesktop();
  const isOnLargeDesktop = useIsOnLargeDesktop();
  const isOnMediumDesktop = useIsOnMediumDesktop();
  const shouldDisplayDropdown = indexOfLastVisibleChild === -1 || indexOfLastVisibleChild < unitIds.length - 1;

  return (
    <div
      style={{ flexBasis: '100%', minWidth: 0 }}
      className={classNames({
        'navigation-tab-width-xl': isOnXLDesktop && isSidebarOpen,
        'navigation-tab-width-large': isOnLargeDesktop && isSidebarOpen,
        'navigation-tab-width-medium': isOnMediumDesktop && isSidebarOpen,
      })}
    >
      <div
        className="sequence-navigation-tabs-container"
      >
        <div
          className="sequence-navigation-tabs d-flex flex-grow-1"
          style={shouldDisplayDropdown ? invisibleStyle : null}
          ref={containerRef}
        >
          {unitIds.map(buttonUnitId => (
            <UnitButton
              key={buttonUnitId}
              unitId={buttonUnitId}
              isActive={unitId === buttonUnitId}
              showCompletion={showCompletion}
              onClick={onNavigate}
            />
          ))}
        </div>
      </div>
      {shouldDisplayDropdown && (
        <SequenceNavigationDropdown
          unitId={unitId}
          onNavigate={onNavigate}
          showCompletion={showCompletion}
          unitIds={unitIds}
        />
      )}
    </div>
  );
};

SequenceNavigationTabs.propTypes = {
  unitId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SequenceNavigationTabs;
