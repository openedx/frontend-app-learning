import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedMessage, getAuthenticatedUser, getLinkProps, getUrlByRouteRole, useIntl,
} from '@openedx/frontend-base';
import { Hyperlink } from '@openedx/paragon';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { coursesRole } from '@src/constants';
import { useCourseHomeMeta } from '../../../course-home/data/apiHooks';

import messages from './messages';
import { logClick } from './utils';
import { useCourseId } from '@src/generic/course-params';

// Suggests the course catalog; nothing when no route provides the courses role.
const CatalogSuggestion = ({ variant }) => {
  const intl = useIntl();
  const courseId = useCourseId();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;
  const catalogUrl = getUrlByRouteRole(coursesRole);
  if (!catalogUrl) {
    return null;
  }
  const { administrator } = getAuthenticatedUser();

  const searchOurCatalogLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      {...getLinkProps(catalogUrl)}
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
};

CatalogSuggestion.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default CatalogSuggestion;
