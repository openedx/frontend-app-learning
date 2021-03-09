import { useState } from 'react';

import { useModel } from '../../generic/model-store';

import MMP2PBlockModal from './BlockModal';
import MMP2PFlyover from './Flyover';
import MMP2PFlyoverMobile from './FlyoverMobile';
import MMP2PFlyoverTrigger from './FlyoverTrigger';
import MMP2PFlyoverTriggerMobile from './FlyoverTriggerMobile';
import MMP2PLockPaywall from './LockPaywall';
import MMP2PSidecard from './Sidecard';

import { isMobile, StrictDict } from './utils';

const MMP2PKeys = StrictDict({
  enableFn: 'enable',
  flyoverVisible: 'flyoverVisible',
  state: 'state',
});

let location;
const windowKey = (field) => `experiment__mmp2p_${location}_${field}`;

const setWindowVal = (field, val) => {
  window[windowKey(field)] = val;
};

const windowVal = (field) => window[windowKey(field)];
const defaultWindowVal = (field, val) => (
  windowVal(field) === undefined ? val : windowVal(field)
);

const externalConfig = {
  runs: [
    {
      upgradeDeadline: 'Mar 29 2021 11:59 PM EST',
      courses: [
        {
          courseRun: 'course-v1:edX+DemoX+Demo_Course',
          subSections: [
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction',
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5',
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions',
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@simulations',
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@graded_simulations',
            'block-v1:edX+DemoX+Demo_Course+type@sequential+block@175e76c4951144a29d46211361266e0e',
          ],
        },
      ],
    },
  ],
};

const initDatesMMP2P = () => {
  location = 'dates';

  const defaultState = {
    isEnabled: false,
    upgradeDeadline: null,
  };

  const [MMP2POptions, setMMP2POptions] = useState(
    defaultWindowVal(MMP2PKeys.state, { ...defaultState }),
  );

  setWindowVal(MMP2PKeys.enableFn, (upgradeDeadline) => {
    if (upgradeDeadline === undefined) {
      setMMP2POptions({ ...defaultState });
    } else {
      setMMP2POptions({
        isEnabled: true,
        upgradeDeadline,
      });
    }
  });

  return {
    state: MMP2POptions,
  };
};

const initHomeMMP2P = (courseId) => {
  location = 'home';

  const defaultState = {
    isEnabled: false,
    upgradeDeadline: null,
    afterUpgradeDeadline: false,
  };

  const [MMP2POptions, setMMP2POptions] = useState(
    defaultWindowVal(MMP2PKeys.state, { ...defaultState }),
  );

  setWindowVal(MMP2PKeys.enableFn, (upgradeDeadline) => {
    if (upgradeDeadline === undefined) {
      setMMP2POptions({ ...defaultState });
    } else {
      setMMP2POptions({
        isEnabled: true,
        upgradeDeadline,
        afterUpgradeDeadline: new Date() > new Date(upgradeDeadline),
      });
    }
  });

  const access = {
    isAudit: false,
    accessExpirationDate: null,
    upgradeUrl: null,
    price: null,
  };

  const { accessExpiration, verifiedMode } = useModel('outline', courseId);
  if (accessExpiration !== null) {
    access.isAudit = true;
    access.accessExpirationDate = accessExpiration.expirationDate;
    access.upgradeUrl = accessExpiration.upgradeUrl;
    access.price = `$${verifiedMode.price}`;
  }

  return {
    state: MMP2POptions,
    access,
  };
};
const initCoursewareMMP2P = (courseId, sequenceId, unitId) => {
  location = 'course';

  const defaultState = {
    isEnabled: false,
    upgradeDeadline: null,
    afterUpgradeDeadline: false,
    subSections: [],
    isWhitelisted: false,
  };

  const [MMP2POptions, _setMMP2POptions] = useState(
    defaultWindowVal(MMP2PKeys.state, { ...defaultState }),
  );

  const setMMP2POptions = (options) => {
    _setMMP2POptions(options);
    setWindowVal(MMP2PKeys.state, options);
  };

  const [isMMP2PFlyoverVisible, setMMP2PFlyoverVisible] = useState(
    isMobile() ? false : defaultWindowVal(MMP2PKeys.flyoverVisible, false),
  );
  const flyover = {
    isVisible: isMMP2PFlyoverVisible,
    toggle: () => {
      setMMP2PFlyoverVisible(!isMMP2PFlyoverVisible);
      setWindowVal(MMP2PKeys.flyoverVisible, !isMMP2PFlyoverVisible);
    },
  };

  setWindowVal(MMP2PKeys.enableFn,
    (upgradeDeadline, subSections) => {
      if (subSections.length !== undefined && subSections.length > 0) {
        setMMP2POptions({
          isEnabled: true,
          upgradeDeadline,
          afterUpgradeDeadline: new Date() > new Date(upgradeDeadline),
          isWhitelisted: subSections.indexOf(sequenceId) > -1,
        });
      } else {
        setMMP2POptions({ ...defaultState });
        setWindowVal(MMP2PKeys.state, { ...defaultState });
      }
    });

  const access = {
    isAudit: false,
    accessExpirationDate: null,
    upgradeUrl: null,
    price: null,
  };

  const { accessExpiration, verifiedMode } = useModel('coursewareMeta', courseId);
  if (accessExpiration !== null) {
    access.isAudit = true;
    access.accessExpirationDate = accessExpiration.expirationDate;
    access.upgradeUrl = accessExpiration.upgradeUrl;
    access.price = `$${verifiedMode.price}`;
  }

  // testing
  setWindowVal('externalConfig', externalConfig);

  const { graded } = useModel('units', unitId);
  const meta = {};
  meta.verifiedLock = (
    access.isAudit
    && !MMP2POptions.isWhitelisted
  );
  meta.gradedLock = (
    access.isAudit
    && MMP2POptions.isWhitelisted
    && graded
  );
  meta.modalLock = (
    access.isAudit
    && !MMP2POptions.isWhitelisted
    && MMP2POptions.afterUpgradeDeadline
  );
  meta.showLock = (
    MMP2POptions.isEnabled
    && (meta.verifiedLock || meta.gradedLock)
  );
  meta.blockContent = (MMP2POptions.isEnabled && meta.verifiedLock);

  return {
    access,
    flyover,
    meta,
    state: MMP2POptions,
  };
};

export {
  MMP2PBlockModal,
  MMP2PFlyover,
  MMP2PFlyoverMobile,
  MMP2PFlyoverTrigger,
  MMP2PFlyoverTriggerMobile,
  MMP2PLockPaywall,
  MMP2PSidecard,
  initCoursewareMMP2P,
  initHomeMMP2P,
  initDatesMMP2P,
};
