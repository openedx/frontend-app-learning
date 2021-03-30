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

const useWindowState = (key, defaultValue) => useState(defaultWindowVal(key, { ...defaultValue }));
const createWindowStateSetter = (stateSetter, key) => (value) => {
  stateSetter(value);
  setWindowVal(key, value);
};

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
  const defaultAccess = {
    isAudit: false,
    accessExpirationDate: null,
    upgradeUrl: null,
    price: null,
  };

  const [MMP2POptions, _setMMP2POptions] = useWindowState(MMP2PKeys.state, { ...defaultState });
  const [MMP2PAccess, _setMMP2PAccess] = useWindowState(MMP2PKeys.access, { ...defaultAccess });

  const setMMP2POptions = createWindowStateSetter(_setMMP2POptions, MMP2PKeys.state);
  const setMMP2PAccess = createWindowStateSetter(_setMMP2PAccess, MMP2PKeys.access);

  const loadAccess = () => {
    const { accessExpiration, verifiedMode } = useModel('coursewareMeta', courseId);

    if (accessExpiration !== null && accessExpiration !== undefined) {
      setMMP2PAccess({
        isAudit: true,
        accessExpirationDate: accessExpiration.expirationDate,
        upgradeUrl: accessExpiration.upgradeUrl,
        price: ((verifiedMode !== null && verifiedMode !== undefined)
          ? `${verifiedMode.currencySymbol}${verifiedMode.price}`
          : ''
        ),
      });
    }
  };

  const enableFunction = (upgradeDeadline) => {
    if (upgradeDeadline === undefined) {
      setMMP2POptions({ ...defaultState });
      setMMP2PAccess({ ...defaultAccess });
    } else {
      setMMP2POptions({
        isEnabled: true,
        upgradeDeadline,
        afterUpgradeDeadline: new Date() > new Date(upgradeDeadline),
      });
      loadAccess();
    }
  };

  setWindowVal(MMP2PKeys.enableFn, enableFunction);

  return {
    state: MMP2POptions,
    access: MMP2PAccess,
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
  const defaultAccess = {
    isAudit: false,
    accessExpirationDate: null,
    upgradeUrl: null,
    price: null,
  };
  const defaultMeta = {
    blockContent: false,
    gradedLock: false,
    modalLock: false,
    showLock: false,
    verifiedLock: false,
  };

  const [MMP2POptions, _setMMP2POptions] = useWindowState(MMP2PKeys.state, { ...defaultState });
  const [MMP2PAccess, _setMMP2PAccess] = useWindowState(MMP2PKeys.access, { ...defaultAccess });
  const [MMP2PMeta, _setMMP2PMeta] = useWindowState(MMP2PKeys.meta, { ...defaultMeta });
  const [MMP2PIsFlyoverVisible, setMMP2PIsFlyoverVisible] = useWindowState(MMP2PKeys.flyoverVisible, !isMobile());

  const setMMP2POptions = createWindowStateSetter(_setMMP2POptions, MMP2PKeys.state);
  const setMMP2PAccess = createWindowStateSetter(_setMMP2PAccess, MMP2PKeys.access);
  const setMMP2PMeta = createWindowStateSetter(_setMMP2PMeta, MMP2PKeys.meta);

  const flyover = {
    isVisible: MMP2PIsFlyoverVisible,
    toggle: () => {
      setMMP2PIsFlyoverVisible(!MMP2PIsFlyoverVisible);
      setWindowVal(MMP2PKeys.flyoverVisible, !MMP2PIsFlyoverVisible);
    },
  };

  const loadAccessAndMeta = () => {
    const { accessExpiration, verifiedMode } = useModel('coursewareMeta', courseId);
    const unitModel = useModel('units', unitId);
    const graded = unitModel !== undefined ? unitModel.graded : false;

    if (accessExpiration !== null && accessExpiration !== undefined) {
      setMMP2PAccess({
        isAudit: true,
        accessExpirationDate: accessExpiration.expirationDate,
        upgradeUrl: accessExpiration.upgradeUrl,
        price: ((verifiedMode !== null && verifiedMode !== undefined)
          ? `${verifiedMode.currencySymbol}${verifiedMode.price}`
          : ''
        ),
      });
    }
    const meta = {
      verifiedLock: (MMP2PAccess.isAudit && !MMP2POptions.isWhitelisted),
      gradedLock: (MMP2PAccess.isAudit && MMP2POptions.isWhitelisted && graded),
      modalLock: (MMP2PAccess.isAudit && !MMP2POptions.isWhitelisted && MMP2POptions.afterUpgradeDeadline),
    };
    meta.showLock = (MMP2POptions.isEnabled && (meta.verifiedLock || meta.gradedLock));
    meta.blockContent = (MMP2POptions.isEnabled && meta.verifiedLock);
    setMMP2PMeta(meta);
  };

  const enableFunction = (upgradeDeadline, subSections) => {
    if (subSections.length !== undefined && subSections.length > 0) {
      setMMP2POptions({
        isEnabled: true,
        upgradeDeadline,
        afterUpgradeDeadline: new Date() > new Date(upgradeDeadline),
        isWhitelisted: subSections.indexOf(sequenceId) > -1,
      });
      loadAccessAndMeta();
    } else {
      setMMP2POptions({ ...defaultState });
      setMMP2PAccess({ ...defaultAccess });
      setMMP2PMeta({ ...defaultMeta });
    }
  };

  setWindowVal(MMP2PKeys.enableFn, enableFunction);

  // testing
  setWindowVal('externalConfig', externalConfig);

  const config = {
    access: MMP2PAccess,
    flyover,
    meta: MMP2PMeta,
    state: MMP2POptions,
  };

  return config;
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
