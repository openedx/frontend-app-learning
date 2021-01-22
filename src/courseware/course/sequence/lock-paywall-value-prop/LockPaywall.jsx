/* TODO: This file should be deleted after REV1512 value prop experiment */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import {
  injectIntl, getLocale,
} from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import classNames from 'classnames';

import VerifiedCert from '../../../../generic/assets/edX_certificate.png';
import { useModel } from '../../../../generic/model-store';
import './LockPaywall.scss';

function LockPaywall({
  courseId,
}) {
  const course = useModel('coursewareMeta', courseId);
  const {
    verifiedMode,
  } = course;
  if (!verifiedMode) {
    return null;
  }
  const {
    currencySymbol,
    price,
    upgradeUrl,
  } = verifiedMode;

  const isSpanish = getLocale() === 'es-419';

  let upgradeButtonText;

  if (document.querySelector('.price.discount') !== null) {
    let discountPrice = document.querySelector('.price.discount').textContent;
    if (discountPrice !== null) {
      discountPrice = discountPrice.replace(/[^0-9.]/g, '');
    }

    if (isSpanish) {
      upgradeButtonText = (
        <>
          <span className="font-weight-bold" style={{ paddingRight: '5px' }}>
            Cómpralo por {currencySymbol}{discountPrice}
          </span>
          <span style={{ textDecoration: 'line-through' }}>
            ({currencySymbol}{price})
          </span>
        </>
      );
    } else {
      upgradeButtonText = (
        <>
          <span className="font-weight-bold" style={{ paddingRight: '5px' }}>
            Upgrade for {currencySymbol}{discountPrice}
          </span>
          <span style={{ textDecoration: 'line-through' }}>
            ({currencySymbol}{price})
          </span>
        </>
      );
    }
  } else if (isSpanish) {
    upgradeButtonText = (
      <>
        <span className="font-weight-bold" style={{ paddingRight: '5px' }}>
          Cómpralo por {currencySymbol}{price}
        </span>
      </>
    );
  } else {
    upgradeButtonText = (
      <>
        <span className="font-weight-bold" style={{ paddingRight: '5px' }}>
          Upgrade for {currencySymbol}{price}
        </span>
      </>
    );
  }

  const circleCheckIcon = (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="float-left mt-1"
      fixedWidth
      aria-hidden="true"
      title="icon"
      style={{ marginRight: '15px' }}
    />
  );
  const verifiedCertificateLink = (
    <b>
      <a
        className="value-prop-verified-certificate-link"
        style={{ textDecoration: 'underline', color: '#00688D' }}
        rel="noopener noreferrer"
        target="_blank"
        href="https://www.edx.org/verified-certificate"
      >
        { (isSpanish) ? 'certificado verificado' : 'verified certificate' }
      </a>
    </b>
  );

  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = Boolean(
    userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
  );

  return (
    <div className="border border-gray d-flex justify-content-between mt-2 p-3 value-prop-lock-paywall-banner">
      <div className={classNames({ 'is-mobile': isMobile })}>
        <div className="font-weight-bold top-banner-text-header">
          <FontAwesomeIcon icon={faLock} className="text-black mr-2 ml-1 lock-icon" style={{ fontSize: '1rem' }} />
          <span className="top-banner-title">
            {
              isSpanish
                ? 'Las tareas calificadas están bloqueadas'
                : 'Graded assignments are locked'
            }
          </span>
        </div>
        <div className="font-weight top-banner-text">
          {
            isSpanish
              ? 'Cámbiate a la opción verificada para obtener acceso a funciones bloqueadas como esta y aprovechar al máximo tu curso.'
              : 'Upgrade to gain access to locked features like this one and get the most out of your course.'
          }
        </div>

        <div className={classNames('mb-0', 'cert-list-wrapper', { 'd-flex': !isMobile })}>

          <div className="certificate-image-banner-container">
            <img
              alt="Example Certificate"
              src={VerifiedCert}
              className="border-0 certificate-image-banner"
            />
          </div>
          <div className="list-container" style={{ float: 'left', paddingLeft: '18px', paddingBottom: '24px' }}>
            <div style={{ paddingBottom: '5px' }}>
              {
                isSpanish
                  ? 'Cuando te cambias a la opción verificada, tú:'
                  : 'When you upgrade, you:'
              }
            </div>

            <div className="list-item-row">
              <div className="check-circle-icon-wrapper">{circleCheckIcon}</div>
              <div className="list-item-wrapper">
                <span>
                  {
                      isSpanish
                        ? <>Obtén un {verifiedCertificateLink} de finalización para compartirlo en tu currículum</>
                        : <>Earn a {verifiedCertificateLink} of completion to showcase on your resume</>
                    }
                </span>
              </div>
            </div>

            <div className="list-item-row">
              <div className="check-circle-icon-wrapper">{circleCheckIcon}</div>
              <div className="list-item-wrapper">
                {
                  isSpanish
                    ? 'Desbloquea el acceso a todas las actividades del curso, incluidas las '
                    : 'Unlock access to all course activities, including '
                }
                <span className="font-weight-bold">
                  {
                    isSpanish
                      ? 'tareas calificadas'
                      : 'graded assignments'
                  }
                </span>
              </div>
            </div>

            <div className="list-item-row">
              <div className="check-circle-icon-wrapper">{circleCheckIcon}</div>
              <div className="list-item-wrapper">
                <span className="font-weight-bold">
                  {
                    isSpanish
                      ? 'Acceso completo'
                      : 'Gain full access'
                  }
                </span>
                {
                  isSpanish
                    ? ' al contenido y los materiales del curso, incluso después de que finalice el curso'
                    : ' to course content and materials, even after the course ends'
                }
              </div>
            </div>

            <div className="list-item-row">
              <div className="check-circle-icon-wrapper">{circleCheckIcon}</div>
              <div className="list-item-wrapper">
                {
                  isSpanish
                    ? 'Apoya nuestra '
                    : 'Support our '
                }
                <span className="font-weight-bold">
                  {
                    isSpanish
                      ? 'misión sin fines de lucro'
                      : 'non-profit mission'
                  }
                </span>
                {
                  isSpanish
                    ? ' en edX'
                    : ' at edX'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="value-prop-upgrade-button-container">
          <Button variant="primary" href={upgradeUrl} className="value-prop-lock-paywall-upgrade-link">
            {upgradeButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
LockPaywall.propTypes = {
  courseId: PropTypes.string.isRequired,
};
export default injectIntl(LockPaywall);
