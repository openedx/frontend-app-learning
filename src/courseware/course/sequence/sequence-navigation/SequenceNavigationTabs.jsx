import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getConfig } from '@edx/frontend-platform';

import UnitButton from './UnitButton';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import useIndexOfLastVisibleChild from '../../../../generic/tabs/useIndexOfLastVisibleChild';
import { useIsOnXLDesktop } from './hooks';
import SidebarContext from '../../sidebar/SidebarContext';
import NewSidebarContext from '../../new-sidebar/SidebarContext';

const SequenceNavigationTabs = ({
  unitIds, unitId, showCompletion, onNavigate,
}) => {
  const enableNewSidebar = getConfig().ENABLE_NEW_SIDEBAR;
  const sidebarContext = enableNewSidebar === 'true' ? NewSidebarContext : SidebarContext;
  const { currentSidebar } = useContext(sidebarContext);
  const [
    indexOfLastVisibleChild,
    containerRef,
    invisibleStyle,
  ] = useIndexOfLastVisibleChild();
  const isOnXLDesktop = useIsOnXLDesktop();
  const shouldDisplayDropdown = indexOfLastVisibleChild === -1;

  return (
    <div style={{ flexBasis: '100%', minWidth: 0 }}>
      <div
        ref={containerRef}
        className={classNames('sequence-navigation-tabs-container', {
          'navigation-tab-width': isOnXLDesktop && currentSidebar,
        })}
      >
        <div
          className="sequence-navigation-tabs d-flex flex-grow-1"
          style={shouldDisplayDropdown ? invisibleStyle : null}
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
