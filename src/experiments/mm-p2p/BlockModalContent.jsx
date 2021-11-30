import React from 'react';
import PropTypes from 'prop-types';
import { Button, ModalLayer } from '@edx/paragon';
import CertImage from '../../generic/assets/edX_certificate.png';

const BulletList = ({ children }) => (
  <div className="bullet-list-item">
    <div className="icon-container">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="far"
        data-icon="check-circle"
        className="svg-inline--fa fa-check-circle fa-w-16 mmp2p-bullet-list"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
        />
      </svg>
    </div>
    <div className="bullet-item-content">
      {children}
    </div>
  </div>
);
BulletList.propTypes = {
  children: PropTypes.node.isRequired,
};

export const BlockModal = () => (
  <ModalLayer
    isOpen
    onClose={() => {}}
    isBlocking
  >
    <div className="mmp2p-modal-dialog modal-content modal-xl">
      <div className="mmp2p-block-modal-wrapper">
        <h3>
          Deadline to access full course has passed
        </h3>
        <div className="subheader">
          What does the Verified Track get you?
        </div>

        <div>
          <BulletList>
            Earn a verified certificate of completion to showcase on your resumé
          </BulletList>
          <BulletList>
            Unlock unlimited access to all course content and activities,
            &nbsp;including graded assignments, even after the course ends.
          </BulletList>
          <BulletList>
            Support our mission at edx
          </BulletList>
        </div>

        <img src={CertImage} className="certificate-image" alt="Example Certificate" />

        <Button
          id="mmp2p-modal-explore-btn"
          variant="brand"
          href="https://www.edx.org/search"
          data-ol-has-click-handler=""
          style={{ fontSize: '1em', fontWeight: 600 }}
        >
          Explore more courses
        </Button>
      </div>
    </div>
  </ModalLayer>
);

export default BlockModal;
