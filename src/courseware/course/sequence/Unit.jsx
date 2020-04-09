import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
} from '@fortawesome/free-solid-svg-icons';

import { getConfig } from '@edx/frontend-platform';
import BookmarkButton from '../bookmark/BookmarkButton';
import { useModel } from '../../../model-store';
import VerifiedCert from '../course-sock/assets/verified-cert.png';

export default function Unit({
  courseId,
  onLoaded,
  id,
}) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0`;

  const [iframeHeight, setIframeHeight] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const unit = useModel('units', id);
  const course = useModel('courses', courseId);
  const {
    contentTypeGatingEnabled,
    enrollmentMode,
    verifiedMode,
  } = course;

  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeHeight(payload.height);
        if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
          setHasLoaded(true);
          if (onLoaded) {
            onLoaded();
          }
        }
      }
    };
  }, []);

  return (
    <div className="unit">
      <h2 className="mb-0 h4">{unit.title}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={unit.bookmarkedUpdateState === 'loading'}
      />
      { contentTypeGatingEnabled && unit.graded && verifiedMode && enrollmentMode === 'audit' && (
        <div className="unit-content-container content-paywall">
          <div>
            <h4>
              <FontAwesomeIcon icon={faLock} />
              <span>Verified Track Access</span>
            </h4>
            <p>
              Graded assessments are available to Verified Track learners.
        &nbsp;
              <a href={verifiedMode.upgradeUrl}>
                Upgrade to unlock
                ({verifiedMode.currencySymbol}{verifiedMode.price})
              </a>
            </p>
          </div>
          <div>
            <img alt="Example Certificate" src={VerifiedCert} />
          </div>
        </div>
      )}
      <div className="unit-iframe-wrapper">
        <iframe
          id="unit-iframe"
          title={unit.title}
          ref={iframeRef}
          src={iframeUrl}
          allowFullScreen
          height={iframeHeight}
          scrolling="no"
          referrerPolicy="origin"
        />
      </div>
    </div>
  );
}

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onLoaded: PropTypes.func,
};

Unit.defaultProps = {
  onLoaded: undefined,
};
