import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { requestCert } from '../data/thunks';

import { useModel } from '../../generic/model-store';
import messages from './messages';
import VerifiedCert from '../../generic/assets/edX_verified_certificate.png';

function CertificateBanner({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    certificateData,
    enrollmentMode,
  } = useModel('progress', courseId);

  if (certificateData === null || enrollmentMode === 'audit') { return null; }
  const { certUrl, certDownloadUrl } = certificateData;
  const dispatch = useDispatch();
  function requestHandler() {
    dispatch(requestCert(courseId));
  }
  return (
    <section className="banner rounded my-4 p-4 container-fluid border border-primary-200 bg-info-100 row">
      <div className="col-12 col-sm-9">
        <div>
          <div className="font-weight-bold">{certificateData.title}</div>
          <div className="mt-1">{certificateData.msg}</div>
        </div>
        {certUrl && (
          <div>
            <a className="btn btn-primary my-3" href={certUrl} rel="noopener noreferrer" target="_blank">
              {intl.formatMessage(messages.viewCert)}
              <span className="sr-only">{intl.formatMessage(messages.opensNewWindow)}</span>
            </a>
          </div>
        )}
        {!certUrl && certificateData.isDownloadable && (
          <div>
            <a className="btn btn-primary my-3" href={certDownloadUrl} rel="noopener noreferrer" target="_blank">
              {intl.formatMessage(messages.downloadCert)}
              <span className="sr-only">{intl.formatMessage(messages.opensNewWindow)}</span>
            </a>
          </div>
        )}
        {!certUrl && !certificateData.isDownloadable && certificateData.isRequestable && (
          <div className="my-3">
            <button className="btn btn-primary" type="button" onClick={requestHandler}>
              {intl.formatMessage(messages.requestCert)}
            </button>
          </div>
        )}
      </div>
      <div className="col-0 col-sm-3 d-none d-sm-block">
        <img
          alt={intl.formatMessage(messages.certAlt)}
          src={VerifiedCert}
          className="float-right"
          style={{ height: '120px' }}
        />
      </div>
    </section>
  );
}

CertificateBanner.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CertificateBanner);
