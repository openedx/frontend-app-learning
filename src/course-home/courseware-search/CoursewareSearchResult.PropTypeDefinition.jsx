import PropTypes from 'prop-types';

export default {
  results: PropTypes.arrayOf(PropTypes.objectOf({
    title: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    type: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(PropTypes.string),
    contentMatches: PropTypes.number,
    isExternal: PropTypes.bool,
  })),
};
