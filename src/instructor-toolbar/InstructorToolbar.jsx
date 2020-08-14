import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { ALERT_TYPES } from '../generic/user-messages';
import Alert from '../generic/user-messages/Alert';
import MasqueradeWidget from './masquerade-widget';

function getInsightsUrl(courseId) {
  const urlBase = getConfig().INSIGHTS_BASE_URL;
  let urlFull;
  if (urlBase) {
    urlFull = `${urlBase}/courses`;
    // This shouldn't actually be missing, at present,
    // but we're providing a reasonable fallback,
    // in case of either error or extension.
    if (courseId) {
      urlFull += `/${courseId}`;
    }
  }
  return urlFull;
}

function getStudioUrl(courseId, unitId) {
  const urlBase = getConfig().STUDIO_BASE_URL;
  let urlFull;
  if (urlBase) {
    if (unitId) {
      urlFull = `${urlBase}/container/${unitId}`;
    } else if (courseId) {
      urlFull = `{$urlBase}/course/${courseId}`;
    }
  }
  return urlFull;
}

export default function InstructorToolbar(props) {
  const {
    courseId,
    unitId,
  } = props;
  const urlInsights = getInsightsUrl(courseId);
  const urlLms = useSelector((state) => {
    if (!unitId) {
      return {};
    }

    const activeUnit = state.models.units[props.unitId];
    return activeUnit ? activeUnit.lmsWebUrl : undefined;
  });
  const urlStudio = getStudioUrl(courseId, unitId);
  const [masqueradeErrorMessage, showMasqueradeError] = useState(null);
  return (
    <div>
      <div className="bg-primary text-light">
        <div className="container-fluid py-3 d-md-flex justify-content-end align-items-center">
          <div className="align-items-center flex-grow-1 d-md-flex mx-1 my-1">
            <MasqueradeWidget courseId={courseId} onError={showMasqueradeError} />
          </div>
          {(urlLms || urlStudio || urlInsights) && (
            <div className="mr-2">View course in:</div>
          )}
          {urlLms && (
            <div className="flex-shrink-0 mx-1 my-1">
              <a className="btn d-block btn-outline-light" href={urlLms}>Existing experience</a>
            </div>
          )}
          {urlStudio && (
            <div className="flex-shrink-0 mx-1 my-1">
              <a className="btn d-block btn-outline-light" href={urlStudio}>Studio</a>
            </div>
          )}
          {urlInsights && (
            <div className="flex-shrink-0 mx-1 my-1">
              <a className="btn d-block btn-outline-light" href={urlInsights}>Insights</a>
            </div>
          )}
        </div>
      </div>
      {masqueradeErrorMessage && (
        <div className="container-fluid mt-3">
          <Alert
            type={ALERT_TYPES.ERROR}
            dismissible={false}
          >
            {masqueradeErrorMessage}
          </Alert>
        </div>
      )}
    </div>
  );
}

InstructorToolbar.propTypes = {
  courseId: PropTypes.string,
  unitId: PropTypes.string,
};

InstructorToolbar.defaultProps = {
  courseId: undefined,
  unitId: undefined,
};
