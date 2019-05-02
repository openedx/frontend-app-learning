import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import messages from './LearningSequencePage.messages';

// Actions
import { fetchLearningSequence } from './actions';
import { pageSelector } from './selectors';
import { PageLoading } from '../common';


class LearningSequencePage extends React.Component {
  constructor(props) {
    super(props);

    this.iframe = React.createRef();
    this.resizeIframe = this.resizeIframe.bind(this);
  }

  componentDidMount() {
    this.props.fetchLearningSequence();
  }

  renderError() {
    return (
      <div>
        {this.props.intl.formatMessage(messages['learn.loading.error'], {
          error: this.props.loadingError,
        })}
      </div>
    );
  }

  renderLoading() {
    return (
      <PageLoading srMessage={this.props.intl.formatMessage(messages['learn.loading.learning.sequence'])} />
    );
  }

  resizeIframe() {
    console.log('**** Resizing iframe...');
    const iframe = this.iframe.current;
    const contentHeight = iframe.contentWindow.document.body.scrollHeight;
    console.log(`**** Height is: ${contentHeight}`);
    iframe.height = contentHeight + 20;
  }

  render() {
    const {
      loading,
      loadingError,
      learningSequence,
    } = this.props;
    const loaded = !loading && !loadingError;

    return (
      <div className="page__learning-sequence container-fluid py-5">
        {loadingError ? this.renderError() : null}
        {loaded && learningSequence.blocks ? (
          <iframe ref={this.iframe} src={Object.values(learningSequence.blocks)[0].student_view_url} onLoad={this.resizeIframe}></iframe>
        ) : null}
        {loading ? this.renderLoading() : null}
      </div>
    );
  }
}


LearningSequencePage.propTypes = {
  intl: intlShape.isRequired,
  username: PropTypes.string,
  learningSequence: PropTypes.arrayOf(PropTypes.shape({
  })),
  loading: PropTypes.bool,
  loadingError: PropTypes.string,
  fetchLearningSequence: PropTypes.func.isRequired,
};

LearningSequencePage.defaultProps = {
  username: null,
  learningSequence: [],
  loading: false,
  loadingError: null,
};


export default connect(pageSelector, {
  fetchLearningSequence,
})(injectIntl(LearningSequencePage));
