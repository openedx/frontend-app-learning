import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useModel } from '../../../generic/model-store';

import messages from './messages';
import { logClick } from './utils';

function CatalogSuggestion({ intl, variant }) {
  const { courseId } = useSelector(state => state.courseware);
  const { org } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  const searchOurCatalogLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={getConfig().SEARCH_CATALOG_URL}
      className="text-reset"
      onClick={() => logClick(org, courseId, administrator, 'catalog_search', { variant })}
    >
      {intl.formatMessage(messages.searchOurCatalogLink)}
    </Hyperlink>
  );

  return (
    <div className="row w-100 mx-0 my-2 justify-content-center" data-testid="catalog-suggestion">
      <div className="col col-md-8 p-4 bg-info-100 text-center">
        <FontAwesomeIcon icon={faSearch} style={{ width: '20px' }} />&nbsp;
        <FormattedMessage
          id="courseExit.catalogSearchSuggestion"
          defaultMessage="Looking to learn more? {searchOurCatalogLink} to find more courses and programs to explore."
          values={{ searchOurCatalogLink }}
          description="Suggesting to learner to explore other course. Shown when they finish the course"
        />
      </div>
    </div>
  );
}

CatalogSuggestion.propTypes = {
  intl: intlShape.isRequired,
  variant: PropTypes.string.isRequired,
};

export default injectIntl(CatalogSuggestion);
