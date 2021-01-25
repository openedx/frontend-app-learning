import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import LearnerQuote1 from './assets/learner-quote.png';
import LearnerQuote2 from './assets/learner-quote2.png';
import { UpgradeButton } from '../upgrade-button';
import VerifiedCert from '../assets/edX_certificate.png';

export default class CourseSock extends Component {
  constructor(props) {
    super(props);
    this.state = { showUpsell: false };
    this.sockElement = React.createRef();
    this.commonEventProperties = {
      courserun_key: this.props.courseId,
      org_key: this.props.orgKey,
    };
    this.promotionEventProperties = {
      creative: 'original_sock',
      name: 'In-Course Verification Prompt',
      position: 'sock',
      promotion_id: 'courseware_verified_certificate_upsell',
      ...this.commonEventProperties,
    };
  }

  componentDidMount() {
    sendTrackEvent('Promotion Viewed', this.promotionEventProperties);
  }

  handleClick = () => {
    this.setState(state => ({
      showUpsell: !state.showUpsell,
    }));

    const toggleLogEvent = this.state.showUpsell ? 'edx.bi.course.sock.toggle_opened'
      : 'edx.bi.course.sock.toggle_closed';
    sendTrackEvent(toggleLogEvent, {
      from_page: this.props.pageLocation,
      ...this.commonEventProperties,
    });
    sendTrackEvent('Promotion Clicked', this.promotionEventProperties);
  }

  logClick = () => {
    sendTrackingLogEvent('edx.course.enrollment.upgrade.clicked', {
      location: 'sock',
      ...this.commonEventProperties,
    });
  }

  showToUser = () => {
    this.setState({
      showUpsell: true,
    }, () => {
      if (this.sockElement.current) {
        this.sockElement.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  render() {
    if (!this.props.verifiedMode) {
      return null;
    }

    const buttonClass = this.state.showUpsell ? 'btn-primary' : 'btn-outline-primary';
    return (
      <div ref={this.sockElement} className="verification-sock container py-5">
        <div className="d-flex justify-content-center">
          <button type="button" aria-expanded="false" className={`btn ${buttonClass}`} onClick={this.handleClick}>
            <FormattedMessage
              id="coursesock.upsell.heading"
              defaultMessage="Learn About Verified Certificates"
              description="The heading for the upsell dialog"
            />
          </button>
        </div>
        {this.state.showUpsell && (
          <>
            <h2 className="mt-3 mb-4">
              <FormattedMessage
                id="coursesock.upsell.verifiedcert"
                defaultMessage="{siteName} Verified Certificate"
                values={{
                  siteName: getConfig().SITE_NAME,
                }}
              />
            </h2>
            <div className="row flex-row-reverse">
              <div className="col-md-4 col-lg-6 d-flex flex-column">
                <div>
                  <img alt="Example Certificate" src={VerifiedCert} className="d-block img-thumbnail mb-3 ml-md-auto" />
                </div>
                <div className="position-relative flex-grow-1 d-flex flex-column justify-content-end align-items-md-end">
                  <div style={{ position: 'sticky', bottom: '4rem' }}>
                    <UpgradeButton
                      size="lg"
                      offer={this.props.offer}
                      onClick={this.logClick}
                      verifiedMode={this.props.verifiedMode}
                      className="mb-3"
                      data-creative="original_sock"
                      data-position="sock"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-8 col-lg-6">
                <h3 className="h5">
                  <FormattedMessage
                    id="coursesock.upsell.why"
                    defaultMessage="Why upgrade?"
                  />
                </h3>
                <ul>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.reason1"
                      defaultMessage="Official proof of completion"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.reason2"
                      defaultMessage="Easily shareable certificate"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.reason3"
                      defaultMessage="Proven motivator to complete the course"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.reason4"
                      defaultMessage="Certificate purchases help {siteName} continue to offer free courses"
                      values={{
                        siteName: getConfig().SITE_NAME,
                      }}
                    />
                  </li>
                </ul>
                <h3 className="h5">
                  <FormattedMessage
                    id="coursesock.upsell.howtitle"
                    defaultMessage="How it works"
                  />
                </h3>
                <ul>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.how1"
                      defaultMessage="Pay the Verified Certificate upgrade fee"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.how2"
                      defaultMessage="Verify your identity with a webcam and government-issued ID"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.how3"
                      defaultMessage="Study hard and pass the course"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="coursesock.upsell.how4"
                      defaultMessage="Share your certificate with friends, employers, and others"
                    />
                  </li>
                </ul>

                <h3 className="h5">
                  <FormattedMessage
                    id="coursesock.upsell.storytitle"
                    defaultMessage="{siteName} Learner Stories"
                    values={{
                      siteName: getConfig().SITE_NAME,
                    }}
                  />
                </h3>
                <div className="media my-3">
                  <img className="mr-3" style={{ maxWidth: '4rem' }} alt="Christina Fong" src={LearnerQuote1} />
                  <div className="media-body">
                    <FormattedMessage
                      id="coursesock.upsell.story1"
                      defaultMessage="My certificate has helped me showcase my knowledge on my
                      resume - I feel like this certificate could really help me land
                      my dream job!"
                    />
                    <p className="font-weight-bold">
                      &mdash; <FormattedMessage
                        id="coursesock.upsell.learner"
                        description="Name of learner"
                        defaultMessage="{name}, {siteName} Learner"
                        values={{
                          name: 'Christina Fong',
                          siteName: getConfig().SITE_NAME,
                        }}
                      />
                    </p>
                  </div>
                </div>
                <div className="media my-3">
                  <img className="mr-3" style={{ maxWidth: '4rem' }} alt="Chery Troell" src={LearnerQuote2} />
                  <div className="media-body">
                    <FormattedMessage
                      id="coursesock.upsell.story2"
                      defaultMessage="I wanted to include a verified certificate on my resume and my profile to
                    illustrate that I am working towards this goal I have and that I have
                    achieved something while I was unemployed."
                    />
                    <p className="font-weight-bold">
                      &mdash; <FormattedMessage
                        id="coursesock.upsell.learner"
                        description="Name of learner"
                        defaultMessage="{name}, {siteName} Learner"
                        values={{
                          name: 'Cheryl Troell',
                          siteName: getConfig().SITE_NAME,
                        }}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

CourseSock.defaultProps = {
  courseId: null,
  offer: null,
  orgKey: null,
};

CourseSock.propTypes = {
  courseId: PropTypes.string,
  offer: PropTypes.shape({}),
  orgKey: PropTypes.string,
  pageLocation: PropTypes.string.isRequired,
  verifiedMode: PropTypes.shape({}).isRequired,
};
