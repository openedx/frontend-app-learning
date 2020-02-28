import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LearnerQuote1 from './course_sock/learner-quote.png';
import LearnerQuote2 from './course_sock/learner-quote2.png';
import VerifiedCert from './course_sock/verified-cert.png';

export default class CourseSock extends Component {
  constructor(props) {
    super(props);
    this.verifiedMode = props.verifiedMode;
    this.state = { showUpsell: false, buttonClass: 'btn-success' };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      showUpsell: !state.showUpsell,
      buttonClass: state.showUpsell ? 'btn-success' : 'btn-outline-success',
    }));
  }

  render() {
    return (
      <div className="verification-sock container py-5">
        <div className="d-flex justify-content-center">
          <button type="button" aria-expanded="false" className={`btn ${this.state.buttonClass}`} onClick={this.handleClick}>
             Learn About Verified Certificates
          </button>
        </div>
        {this.state.showUpsell && (
        <div className="d-flex justify-content-around">
          <div className="mt-3">
            <h2 className="font-weight-lighter">edX Verified Certificate</h2>
            <h3>Why upgrade?</h3>
            <ul>
              <li>Official proof of completion</li>
              <li>Easily shareable certificate</li>
              <li>Proven motivator to complete the course</li>
              <li>Certificate purchases help edX continue to offer free courses</li>
            </ul>
            <h3>How it works</h3>
            <ul>
              <li>Pay the Verified Certificate upgrade fee</li>
              <li>Verify your identity with a webcam and government-issued ID</li>
              <li>Study hard and pass the course</li>
              <li>Share your certificate with friends, employers, and others</li>
            </ul>
            <h3>edX Learner Stories</h3>
            <div className="d-flex align-items-center my-4">
              <img style={{ maxWidth: '4rem' }} alt="Christina Fong" src={LearnerQuote1} />
              <div className="w-50 px-4">
                   My certificate has helped me showcase my knowledge on my
                   resume - I feel like this certificate could really help me land
                   my dream job!<br />
                <strong>&mdash; Christina Fong, edX Learner</strong>
              </div>
            </div>
            <div className="d-flex align-items-center my-2">
              <img style={{ maxWidth: '4rem' }} alt="Chery Troell" src={LearnerQuote2} />
              <div className="w-50 px-4">
                 I wanted to include a verified certificate on my resume and my profile to
                 illustrate that I am working towards this goal I have and that I have
                 achieved something while I was unemployed.<br />
                <strong>&mdash; Cheryl Troell, edX Learner</strong>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column justify-content-between">
            <img alt="Example Certificate" src={VerifiedCert} />
            <a href={this.verifiedMode.upgradeUrl} className="btn btn-success btn-lg btn-upgrade focusable" data-creative="original_sock" data-position="sock">
             Upgrade ({this.verifiedMode.currencySymbol}{this.verifiedMode.price} {this.verifiedMode.currency})
            </a>
          </div>
        </div>
        )}
      </div>
    );
  }
}

CourseSock.propTypes = {
  verifiedMode: PropTypes.objectOf(PropTypes.shape({
    price: PropTypes.string,
    currency: PropTypes.string,
    currencySymbol: PropTypes.string,
    sku: PropTypes.string,
    upgradeUrl: PropTypes.string,
  })),
};

CourseSock.defaultProps = {
  verifiedMode: null,
};
